/**
 * Unit tests for the matching algorithm.
 *
 * These import the real implementation from services/matchingService.js rather
 * than reproducing it, so the tests cannot drift from the code they describe.
 *
 * Where the current behaviour is wrong, the test asserts the wrong behaviour
 * and is named to say so. A test suite that quietly asserts what the code
 * *should* do would fail on correct code and pass on nothing; the defects are
 * tracked in Chapter 4, §4.10 and fixed separately.
 */

const {
  WEIGHTS,
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
} = require('../../services/matchingService');

describe('normalize', () => {
  it('lowercases', () => {
    expect(normalize('Mathematics')).toBe('mathematics');
  });

  it('removes spaces, hyphens and underscores', () => {
    expect(normalize('Data Structures')).toBe('datastructures');
    expect(normalize('data-structures')).toBe('datastructures');
    expect(normalize('data_structures')).toBe('datastructures');
  });

  it('treats differently written forms of the same subject as equal', () => {
    expect(normalize('Machine Learning')).toBe(normalize('machinelearning'));
  });

  it('collapses symbol-heavy names to almost nothing (defect D-24)', () => {
    // Documented, not desired. "C++" and "C#" both reduce to a single letter,
    // which then substring-matches most subjects. See Chapter 5, §5.3.2.
    expect(normalize('C++')).toBe('c');
    expect(normalize('C#')).toBe('c');
    expect(normalize('.NET')).toBe('net');
  });
});

describe('levenshteinDistance', () => {
  it('is zero for identical strings', () => {
    expect(levenshteinDistance('physics', 'physics')).toBe(0);
  });

  it('counts a single substitution', () => {
    expect(levenshteinDistance('physics', 'phisics')).toBe(1);
  });

  it('counts an insertion', () => {
    expect(levenshteinDistance('cat', 'cart')).toBe(1);
  });

  it('is symmetric', () => {
    expect(levenshteinDistance('kitten', 'sitting'))
      .toBe(levenshteinDistance('sitting', 'kitten'));
  });

  it('equals the longer length when nothing is shared', () => {
    expect(levenshteinDistance('abc', 'xyz')).toBe(3);
  });

  it('handles an empty string', () => {
    expect(levenshteinDistance('', 'abcd')).toBe(4);
  });
});

describe('fuzzyMatch tiers', () => {
  it('scores an exact match highest', () => {
    const r = fuzzyMatch('Mathematics', 'Mathematics');
    expect(r).toMatchObject({ match: true, tier: 'exact', score: WEIGHTS.EXACT_SUBJECT });
  });

  it('treats case and punctuation differences as exact', () => {
    expect(fuzzyMatch('mathematics', 'MATHEMATICS').tier).toBe('exact');
    expect(fuzzyMatch('Data Structures', 'data-structures').tier).toBe('exact');
  });

  it('scores a substring match below exact', () => {
    const r = fuzzyMatch('Maths', 'Advanced Maths');
    expect(r).toMatchObject({ match: true, tier: 'substring' });
    expect(r.score).toBeLessThan(WEIGHTS.EXACT_SUBJECT);
  });

  it('scores a shared three-character prefix below substring', () => {
    const r = fuzzyMatch('Chemistry', 'Chemical');
    expect(r).toMatchObject({ match: true, tier: 'prefix', score: WEIGHTS.PREFIX_SUBJECT });
  });

  it('tolerates a spelling error through edit distance', () => {
    const r = fuzzyMatch('Physics', 'Phisics');
    expect(r.match).toBe(true);
    expect(r.tier).toBe('levenshtein');
    expect(r.score).toBeGreaterThan(0);
  });

  it('rejects unrelated subjects', () => {
    expect(fuzzyMatch('Biology', 'History')).toMatchObject({ match: false, score: 0 });
    expect(fuzzyMatch('Art', 'Cat').match).toBe(false);
  });

  it('orders the tiers exact > substring > prefix', () => {
    expect(WEIGHTS.EXACT_SUBJECT)
      .toBeGreaterThan(WEIGHTS.SUBSTRING_SUBJECT);
    expect(WEIGHTS.SUBSTRING_SUBJECT)
      .toBeGreaterThan(WEIGHTS.PREFIX_SUBJECT);
  });

  it('is symmetric in its arguments', () => {
    expect(fuzzyMatch('Maths', 'Advanced Maths').score)
      .toBe(fuzzyMatch('Advanced Maths', 'Maths').score);
  });
});

describe('fuzzyMatch known defects', () => {
  it('matches Java against JavaScript (D-16)', () => {
    // Accepted consequence of favouring recall; predicted in Chapter 3, §3.8.4.
    expect(fuzzyMatch('Java', 'JavaScript')).toMatchObject({ match: true, tier: 'substring' });
  });

  it('matches C++ against any subject containing "c" (D-24)', () => {
    // Not an accepted trade-off — a genuine error, kept here so a fix is
    // detectable: this test should be inverted when D-24 is corrected.
    for (const subject of ['Calculus', 'Chemistry', 'Music', 'French', 'Sociology']) {
      expect(fuzzyMatch('C++', subject).match).toBe(true);
    }
  });
});

describe('complementaryStatus', () => {
  it('pairs a learner with teachers', () => {
    expect(complementaryStatus(STATUS.LEARN)).toEqual([STATUS.TEACH]);
  });

  it('pairs a teacher with learners', () => {
    expect(complementaryStatus(STATUS.TEACH)).toEqual([STATUS.LEARN]);
  });

  it('gives an unavailable user no complement', () => {
    expect(complementaryStatus(STATUS.LATER)).toEqual([]);
  });

  it('gives an unknown status no complement', () => {
    expect(complementaryStatus(undefined)).toEqual([]);
    expect(complementaryStatus('Nonsense')).toEqual([]);
  });
});

describe('scoreSubjects', () => {
  it('counts each requester subject at most once', () => {
    // "Maths" matches both candidate entries; only the first should score.
    const { matched } = scoreSubjects(['Maths'], ['Maths', 'Advanced Maths']);
    expect(matched).toHaveLength(1);
  });

  it('scores nothing when there is no overlap', () => {
    expect(scoreSubjects(['Biology'], ['History'])).toMatchObject({ score: 0, matched: [] });
  });

  it('tolerates missing subject arrays', () => {
    expect(scoreSubjects(undefined, undefined).score).toBe(0);
  });
});

describe('scoreUser', () => {
  const learner = { status: STATUS.LEARN, subjects: ['Calculus', 'Data Structures'] };

  it('reproduces the worked example from Chapter 3, §3.8.12', () => {
    const kwame = {
      status: STATUS.TEACH,
      subjects: ['calculus', 'data-structures'],
      isOnline: true,
    };
    // 20 role + 10 + 10 subjects + 3 online + (2 matched x 2) = 47
    expect(scoreUser(learner, kwame).score).toBe(47);
  });

  it('reproduces the non-complementary case from the same example', () => {
    const efua = { status: STATUS.LEARN, subjects: ['Calculus'], isOnline: false };
    expect(scoreUser(learner, efua).score).toBe(10);
  });

  it('ranks a complementary role above pure subject overlap', () => {
    const teacherOneSubject = { status: STATUS.TEACH, subjects: ['Calculus'] };
    const learnerBothSubjects = {
      status: STATUS.LEARN, subjects: ['Calculus', 'Data Structures'],
    };
    expect(scoreUser(learner, teacherOneSubject).score)
      .toBeGreaterThan(scoreUser(learner, learnerBothSubjects).score);
  });

  it('awards the online bonus', () => {
    const base = { status: STATUS.TEACH, subjects: ['Calculus'] };
    const online = { ...base, isOnline: true };
    expect(scoreUser(learner, online).score - scoreUser(learner, base).score)
      .toBe(WEIGHTS.ONLINE);
  });

  it('awards nothing for a candidate with no shared subject and no role match', () => {
    const stranger = { status: STATUS.LATER, subjects: ['History'] };
    expect(scoreUser(learner, stranger).score).toBe(0);
  });

  it('gives an unavailable candidate no role bonus (relates to D-11)', () => {
    const later = { status: STATUS.LATER, subjects: ['Calculus'] };
    expect(scoreUser(learner, later).score).toBe(WEIGHTS.EXACT_SUBJECT);
  });
});

describe('scoreGroup', () => {
  const requester = { status: STATUS.LEARN, subjects: ['Calculus'] };

  it('rewards existing membership', () => {
    const empty = { subjects: ['Calculus'], members: [] };
    const populated = { subjects: ['Calculus'], members: new Array(5).fill('x') };
    expect(scoreGroup(requester, populated).score)
      .toBeGreaterThan(scoreGroup(requester, empty).score);
  });

  it('caps the membership bonus so large groups cannot dominate for ever', () => {
    const big = { subjects: ['Calculus'], members: new Array(500).fill('x') };
    const atCap = { subjects: ['Calculus'], members: new Array(WEIGHTS.GROUP_SIZE_CAP).fill('x') };
    expect(scoreGroup(requester, big).score).toBe(scoreGroup(requester, atCap).score);
  });

  it('applies no role bonus, because a group has no teach or learn role', () => {
    const group = { subjects: ['Calculus'], members: [] };
    expect(scoreGroup(requester, group).score).toBe(WEIGHTS.EXACT_SUBJECT);
  });
});

describe('ranking', () => {
  it('orders users by descending score', () => {
    const ranked = rankUsers([
      { name: 'low', matchScore: 5 },
      { name: 'high', matchScore: 40 },
      { name: 'mid', matchScore: 20 },
    ]);
    expect(ranked.map((u) => u.name)).toEqual(['high', 'mid', 'low']);
  });

  it('breaks a score tie in favour of an online user', () => {
    const ranked = rankUsers([
      { name: 'offline', matchScore: 20, isOnline: false },
      { name: 'online', matchScore: 20, isOnline: true },
    ]);
    expect(ranked[0].name).toBe('online');
  });

  it('breaks a score and presence tie by most recent activity', () => {
    const ranked = rankUsers([
      { name: 'older', matchScore: 20, isOnline: false, lastSeen: '2026-01-01' },
      { name: 'newer', matchScore: 20, isOnline: false, lastSeen: '2026-06-01' },
    ]);
    expect(ranked[0].name).toBe('newer');
  });

  it('truncates to the result limit', () => {
    const many = Array.from({ length: 40 }, (_, i) => ({ matchScore: i }));
    expect(rankUsers(many)).toHaveLength(15);
  });

  it('does not mutate the input', () => {
    const input = [{ matchScore: 1 }, { matchScore: 9 }];
    const copy = [...input];
    rankUsers(input);
    expect(input).toEqual(copy);
  });

  it('orders groups by score then by newest', () => {
    const ranked = rankGroups([
      { name: 'old', matchScore: 10, createdAt: '2026-01-01' },
      { name: 'new', matchScore: 10, createdAt: '2026-06-01' },
      { name: 'best', matchScore: 30, createdAt: '2020-01-01' },
    ]);
    expect(ranked.map((g) => g.name)).toEqual(['best', 'new', 'old']);
  });
});
