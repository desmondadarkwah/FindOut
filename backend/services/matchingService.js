/**
 * matchingService.js — the peer matching algorithm.
 *
 * Extracted from controllers/Suggestions.js so the algorithm can be tested
 * without a database or an HTTP server. It holds behaviour but no state: every
 * function here is pure, which is what makes the unit tests meaningful. The
 * controller is responsible for loading candidates and for persistence.
 *
 * The weights are specified and justified in Chapter 3, §3.8.6.
 */

/* ── weights ───────────────────────────────────────────────────────────────
   Named rather than inlined so a test asserts against the same constant the
   implementation uses, and a change cannot silently diverge from the thesis. */
const WEIGHTS = Object.freeze({
  COMPLEMENTARY_ROLE: 20,   // dominates: a role match must outrank subject overlap
  EXACT_SUBJECT: 10,
  SUBSTRING_SUBJECT: 7,
  PREFIX_SUBJECT: 5,
  LEVENSHTEIN_MAX: 5,       // scaled by similarity
  ONLINE: 3,
  MULTI_SUBJECT: 2,         // per matched subject, when more than one matched
  GROUP_SIZE_CAP: 15,
  GROUP_MULTI_SUBJECT: 3,
});

const SIMILARITY_THRESHOLD = 0.7;
const RESULT_LIMIT = 15;

const STATUS = Object.freeze({
  TEACH: 'Ready To Teach',
  LEARN: 'Ready To Learn',
  LATER: 'Later',
});

/**
 * Strip case, punctuation and spacing so that "Data Structures",
 * "data-structures" and "DataStructures" compare equal.
 *
 * Known limitation: subjects consisting mostly of stripped characters collapse
 * to almost nothing — "C++" and "C#" both reduce to "c". This is defect D-24;
 * see Chapter 5, §5.3.2. The behaviour is preserved here deliberately so the
 * tests document what the system currently does rather than what it should do.
 */
function normalize(str) {
  return String(str).toLowerCase().replace(/[+#.\-_\s]/g, '').trim();
}

/** Minimum single-character edits to turn one string into the other. */
function levenshteinDistance(str1, str2) {
  const matrix = [];
  for (let i = 0; i <= str2.length; i++) matrix[i] = [i];
  for (let j = 0; j <= str1.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      matrix[i][j] = str2.charAt(i - 1) === str1.charAt(j - 1)
        ? matrix[i - 1][j - 1]
        : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[str2.length][str1.length];
}

/**
 * Compare two free-text subject names in four tiers, most confident first.
 * Evaluation stops at the first tier that matches, so the expensive edit
 * distance runs only when the cheaper tests fail.
 *
 * @returns {{match: boolean, score: number, tier: string}}
 */
function fuzzyMatch(str1, str2) {
  const n1 = normalize(str1);
  const n2 = normalize(str2);

  if (n1 === n2) {
    return { match: true, score: WEIGHTS.EXACT_SUBJECT, tier: 'exact' };
  }
  if (n1.includes(n2) || n2.includes(n1)) {
    return { match: true, score: WEIGHTS.SUBSTRING_SUBJECT, tier: 'substring' };
  }
  if (n1.length >= 3 && n2.length >= 3 && n1.substring(0, 3) === n2.substring(0, 3)) {
    return { match: true, score: WEIGHTS.PREFIX_SUBJECT, tier: 'prefix' };
  }

  const distance = levenshteinDistance(n1, n2);
  const similarity = 1 - distance / Math.max(n1.length, n2.length);
  if (similarity >= SIMILARITY_THRESHOLD) {
    return {
      match: true,
      score: Math.floor(similarity * WEIGHTS.LEVENSHTEIN_MAX),
      tier: 'levenshtein',
    };
  }
  return { match: false, score: 0, tier: 'none' };
}

/**
 * The status that complements the requester's. This is what makes the system a
 * reciprocal recommender: a learner is matched to a teacher, not to another
 * learner. `Later` has no complement.
 */
function complementaryStatus(status) {
  if (status === STATUS.LEARN) return [STATUS.TEACH];
  if (status === STATUS.TEACH) return [STATUS.LEARN];
  return [];
}

/**
 * Best fuzzy score for each of the requester's subjects against a candidate's.
 * Scored once per requester subject rather than per pair, so a candidate
 * listing many subjects is not over-rewarded.
 */
function scoreSubjects(requesterSubjects = [], candidateSubjects = []) {
  let score = 0;
  const matched = [];

  for (const mine of requesterSubjects) {
    for (const theirs of candidateSubjects) {
      const result = fuzzyMatch(mine, theirs);
      if (result.match) {
        score += result.score;
        matched.push({ yours: mine, theirs, score: result.score, tier: result.tier });
        break;                       // first match wins for this subject
      }
    }
  }
  return { score, matched };
}

/** Score one candidate peer. Returns 0 when nothing matches. */
function scoreUser(requester, candidate) {
  const targets = complementaryStatus(requester.status);
  let score = 0;

  if (targets.length > 0 && targets.includes(candidate.status)) {
    score += WEIGHTS.COMPLEMENTARY_ROLE;
  }

  const { score: subjectScore, matched } =
    scoreSubjects(requester.subjects, candidate.subjects || []);
  score += subjectScore;

  if (candidate.isOnline) score += WEIGHTS.ONLINE;
  if (matched.length > 1) score += matched.length * WEIGHTS.MULTI_SUBJECT;

  return { score, matchedSubjects: matched };
}

/** Score one candidate group. Groups carry no teach/learn role. */
function scoreGroup(requester, group) {
  const { score: subjectScore, matched } =
    scoreSubjects(requester.subjects, group.subjects || []);

  let score = subjectScore;
  score += Math.min((group.members || []).length, WEIGHTS.GROUP_SIZE_CAP);
  if (matched.length > 1) score += matched.length * WEIGHTS.GROUP_MULTI_SUBJECT;

  return { score, matchedSubjects: matched };
}

/** Sort by score, break ties by presence then recency, and truncate. */
function rankUsers(scored, limit = RESULT_LIMIT) {
  return [...scored]
    .sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      if (Boolean(b.isOnline) !== Boolean(a.isOnline)) return b.isOnline ? 1 : -1;
      return new Date(b.lastSeen || 0) - new Date(a.lastSeen || 0);
    })
    .slice(0, limit);
}

/** Sort groups by score, break ties by newest first, and truncate. */
function rankGroups(scored, limit = RESULT_LIMIT) {
  return [...scored]
    .sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    })
    .slice(0, limit);
}

module.exports = {
  WEIGHTS,
  SIMILARITY_THRESHOLD,
  RESULT_LIMIT,
  STATUS,
  normalize,
  levenshteinDistance,
  fuzzyMatch,
  complementaryStatus,
  scoreSubjects,
  scoreUser,
  scoreGroup,
  rankUsers,
  rankGroups,
};
