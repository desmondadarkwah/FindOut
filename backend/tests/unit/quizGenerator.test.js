/**
 * Unit tests for question generation and marking.
 *
 * generateQuiz touches the database for caching, so only the pure parts are
 * covered here: template generation and grading. The cached path is exercised
 * by the integration suite.
 */

const quizGenerator = require('../../services/quizGenerator');

describe('generateMockQuestions', () => {
  const questions = quizGenerator.generateMockQuestions('Calculus');

  it('produces exactly ten questions', () => {
    expect(questions).toHaveLength(10);
  });

  it('gives every question four options', () => {
    for (const q of questions) {
      expect(Array.isArray(q.options)).toBe(true);
      expect(q.options).toHaveLength(4);
    }
  });

  it('gives every question a correct answer within range', () => {
    for (const q of questions) {
      expect(q.correctAnswer).toBeGreaterThanOrEqual(0);
      expect(q.correctAnswer).toBeLessThanOrEqual(3);
    }
  });

  it('gives every question a difficulty from the allowed set', () => {
    for (const q of questions) {
      expect(['easy', 'medium', 'hard']).toContain(q.difficulty);
    }
  });

  it('interpolates the subject into the question text', () => {
    expect(questions.some((q) => q.question.includes('Calculus'))).toBe(true);
  });

  it('produces structurally identical questions for any subject (defect D-06)', () => {
    // Documented, not desired. The templates are subject-independent, so the
    // badge signals views about teaching rather than subject knowledge.
    // See Chapter 3, §3.9.4.
    const a = quizGenerator.generateMockQuestions('Calculus');
    const b = quizGenerator.generateMockQuestions('Sociology');
    expect(a.map((q) => q.correctAnswer)).toEqual(b.map((q) => q.correctAnswer));
    expect(a.map((q) => q.difficulty)).toEqual(b.map((q) => q.difficulty));
  });
});

describe('gradeQuiz', () => {
  const questions = quizGenerator.generateMockQuestions('Calculus');
  const key = questions.map((q) => q.correctAnswer);
  const wrong = (i) => (key[i] === 0 ? 1 : 0);

  it('awards full marks for a perfect submission', () => {
    const r = quizGenerator.gradeQuiz(questions, key);
    expect(r).toMatchObject({ score: 10, totalQuestions: 10, percentage: 100, passed: true });
  });

  it('awards nothing when every answer is wrong', () => {
    const r = quizGenerator.gradeQuiz(questions, key.map((_, i) => wrong(i)));
    expect(r).toMatchObject({ score: 0, percentage: 0, passed: false });
  });

  it('passes at the 70 per cent threshold', () => {
    const seven = key.map((v, i) => (i < 7 ? v : wrong(i)));
    const r = quizGenerator.gradeQuiz(questions, seven);
    expect(r.score).toBe(7);
    expect(r.percentage).toBe(70);
    expect(r.passed).toBe(true);
  });

  it('fails immediately below the threshold', () => {
    const six = key.map((v, i) => (i < 6 ? v : wrong(i)));
    const r = quizGenerator.gradeQuiz(questions, six);
    expect(r.score).toBe(6);
    expect(r.passed).toBe(false);
  });

  it('marks an unanswered question as incorrect rather than throwing', () => {
    const partial = key.map((v, i) => (i < 5 ? v : undefined));
    const r = quizGenerator.gradeQuiz(questions, partial);
    expect(r.score).toBe(5);
    expect(r.passed).toBe(false);
  });

  it('returns a graded record for every question', () => {
    const r = quizGenerator.gradeQuiz(questions, key);
    expect(r.questions).toHaveLength(10);
    for (const q of r.questions) {
      expect(q).toHaveProperty('question');
      expect(q).toHaveProperty('isCorrect');
      expect(q).toHaveProperty('userAnswer');
    }
  });

  it('rounds the percentage to a whole number', () => {
    const three = key.map((v, i) => (i < 3 ? v : wrong(i)));
    expect(Number.isInteger(quizGenerator.gradeQuiz(questions, three).percentage)).toBe(true);
  });
});
