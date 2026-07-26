// Functions extracted verbatim from backend/controllers/Suggestions.js
const levenshteinDistance = (str1, str2) => {
  const matrix = [];
  for (let i = 0; i <= str2.length; i++) matrix[i] = [i];
  for (let j = 0; j <= str1.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(matrix[i-1][j-1]+1, matrix[i][j-1]+1, matrix[i-1][j]+1);
      }
    }
  }
  return matrix[str2.length][str1.length];
};

const fuzzyMatch = (str1, str2) => {
  const normalize = (str) => str.toLowerCase().replace(/[+#.\-_\s]/g, '').trim();
  const n1 = normalize(str1);
  const n2 = normalize(str2);
  if (n1 === n2) return { match: true, score: 10, tier: 'exact' };
  if (n1.includes(n2) || n2.includes(n1)) return { match: true, score: 7, tier: 'substring' };
  if (n1.length >= 3 && n2.length >= 3 && n1.substring(0,3) === n2.substring(0,3)) {
    return { match: true, score: 5, tier: 'prefix' };
  }
  const distance = levenshteinDistance(n1, n2);
  const maxLen = Math.max(n1.length, n2.length);
  const similarity = 1 - distance / maxLen;
  if (similarity >= 0.7) return { match: true, score: Math.floor(similarity * 5), tier: 'levenshtein', sim: similarity.toFixed(3) };
  return { match: false, score: 0, tier: 'none', sim: similarity.toFixed(3) };
};

const cases = [
  ['TU-01','Mathematics','Mathematics','match, 10'],
  ['TU-02','mathematics','MATHEMATICS','match, 10'],
  ['TU-03','C++','cpp','match, 10'],
  ['TU-04','Data Structures','data-structures','match, 10'],
  ['TU-05','Maths','Advanced Maths','match, 7'],
  ['TU-06','Programming','Program','match, 7'],
  ['TU-07','Chemistry','Chemical','match, 5'],
  ['TU-08','Physics','Phisics','match, >0'],
  ['TU-09','Biology','History','no match, 0'],
  ['TU-10','Java','JavaScript','match, 7 (false positive)'],
  ['TU-11','Statistics','Statistic','match'],
  ['TU-12','Calculus','calculus','match, 10'],
  ['TU-13','Machine Learning','machinelearning','match, 10'],
  ['TU-14','Economics','Economy','match, 5'],
  ['TU-15','Art','Cat','no match'],
];

console.log('ID     | Input A          | Input B          | Expected             | Actual tier   | Score | Match');
console.log('-------|------------------|------------------|----------------------|---------------|-------|------');
for (const [id,a,b,exp] of cases) {
  const r = fuzzyMatch(a,b);
  console.log(
    `${id.padEnd(6)} | ${a.padEnd(16)} | ${b.padEnd(16)} | ${exp.padEnd(20)} | ${r.tier.padEnd(13)} | ${String(r.score).padEnd(5)} | ${r.match}`
  );
}
