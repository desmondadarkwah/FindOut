const QuizModel = require('../models/QuizModel');

class QuizGenerator {
  /**
   * Generate mock quiz questions (no API needed)
   * Works for ANY subject - personalizes question text with subject name
   */
  async generateQuiz(subject) {
    try {
      console.log(` Generating MOCK quiz for subject: ${subject}`);

      // Check if we have a cached quiz for this subject
      const cachedQuiz = await QuizModel.findOne({
        subject: subject,
        expiresAt: { $gt: new Date() }
      }).sort({ createdAt: -1 });

      if (cachedQuiz && cachedQuiz.questions.length === 10) {
        console.log(`✅ Using cached quiz for ${subject}`);
        cachedQuiz.timesUsed += 1;
        await cachedQuiz.save();
        return cachedQuiz.questions;
      }

      // Generate mock questions
      const questions = this.generateMockQuestions(subject);

      // Cache the quiz
      await QuizModel.create({
        subject,
        questions,
        timesUsed: 1
      });

      console.log(`✅ Generated and cached new MOCK quiz for ${subject}`);
      return questions;

    } catch (error) {
      console.error('Error generating quiz:', error);
      throw new Error('Failed to generate quiz questions');
    }
  }

  /**
   * Generate mock questions for testing
   * These questions test teaching ability, not subject-specific knowledge
   */
  generateMockQuestions(subject) {
    const templates = [
      {
        question: `What is the most important foundation when teaching ${subject}?`,
        options: [
          "Ensuring students understand core concepts before moving forward",
          "Rushing through material to cover everything quickly",
          "Only focusing on memorization without understanding",
          "Skipping fundamentals and jumping to advanced topics"
        ],
        correctAnswer: 0,
        difficulty: "easy",
        explanation: "Building strong foundations ensures students can handle more complex topics later."
      },
      {
        question: `Which teaching approach works best for ${subject}?`,
        options: [
          "Only lecturing without any student interaction",
          "Combining explanations with hands-on practice and real examples",
          "Avoiding student questions to save time",
          "Reading directly from textbooks without elaboration"
        ],
        correctAnswer: 1,
        difficulty: "easy",
        explanation: "Active learning through practice and examples helps students retain information better."
      },
      {
        question: `What is a common challenge students face when learning ${subject}?`,
        options: [
          "Having too much support from teachers",
          "Moving too fast without fully understanding each concept",
          "Asking too many clarifying questions",
          "Practicing regularly and consistently"
        ],
        correctAnswer: 1,
        difficulty: "medium",
        explanation: "Students often struggle when they don't take time to fully grasp each concept before moving on."
      },
      {
        question: `How should you evaluate if students understand ${subject}?`,
        options: [
          "Never check, just assume they understand",
          "Use varied assessments: quizzes, discussions, projects, and practical tasks",
          "Only give one final exam at the end",
          "Just ask 'Does everyone understand?' and move on"
        ],
        correctAnswer: 1,
        difficulty: "medium",
        explanation: "Multiple assessment methods give a complete picture of student understanding."
      },
      {
        question: `What resources enhance learning in ${subject}?`,
        options: [
          "Only one textbook and nothing else",
          "Diverse materials: videos, interactive exercises, real-world examples, and practice problems",
          "No additional resources beyond lectures",
          "Only theoretical reading materials"
        ],
        correctAnswer: 1,
        difficulty: "easy",
        explanation: "Different learning materials help students understand concepts from multiple angles."
      },
      {
        question: `When students struggle with ${subject}, what should you do?`,
        options: [
          "Tell them they're not smart enough for the subject",
          "Provide extra support, break concepts into smaller steps, offer additional practice",
          "Ignore struggling students and focus on advanced learners",
          "Move faster through material to catch up with the syllabus"
        ],
        correctAnswer: 1,
        difficulty: "medium",
        explanation: "Personalized support helps struggling students build confidence and understanding."
      },
      {
        question: `How do you make ${subject} interesting and engaging for students?`,
        options: [
          "Make lessons as theoretical and abstract as possible",
          "Connect concepts to real-life applications and student interests",
          "Focus only on rote memorization and repetition",
          "Avoid any interactive or hands-on activities"
        ],
        correctAnswer: 1,
        difficulty: "medium",
        explanation: "Real-world connections make learning relevant and maintain student motivation."
      },
      {
        question: `In teaching ${subject}, how important is regular practice?`,
        options: [
          "Practice is essential for building skills and confidence",
          "Practice is unnecessary if students understand the theory",
          "Students should only practice once before tests",
          "Practice should be avoided as it takes too much time"
        ],
        correctAnswer: 0,
        difficulty: "easy",
        explanation: "Consistent practice reinforces learning and develops mastery over time."
      },
      {
        question: `What should be your main goal when teaching ${subject}?`,
        options: [
          "Finishing the entire syllabus as quickly as possible",
          "Ensuring students can understand, apply, and think critically about concepts",
          "Making the subject seem as difficult as possible",
          "Only teaching what appears on standardized tests"
        ],
        correctAnswer: 1,
        difficulty: "medium",
        explanation: "Deep understanding and application are more valuable than superficial coverage."
      },
      {
        question: `How do you stay effective as a ${subject} teacher?`,
        options: [
          "Never update your knowledge or teaching methods",
          "Continuously learn through courses, reading, peer collaboration, and student feedback",
          "Only teach what you learned years ago",
          "Assume you already know everything about teaching"
        ],
        correctAnswer: 1,
        difficulty: "hard",
        explanation: "Continuous professional growth ensures you provide the best education to your students."
      }
    ];

    return templates;
  }

  /**
   * Grade a quiz attempt
   * Compares user answers with correct answers and calculates score
   */
  gradeQuiz(questions, userAnswers) {
    let correctCount = 0;
    const gradedQuestions = [];

    questions.forEach((question, index) => {
      const userAnswer = userAnswers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) correctCount++;

      gradedQuestions.push({
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        userAnswer: userAnswer,
        isCorrect: isCorrect,
        explanation: question.explanation
      });
    });

    const percentage = (correctCount / questions.length) * 100;
    const passed = percentage >= 70; // 70% pass threshold

    return {
      score: correctCount,
      totalQuestions: questions.length,
      percentage: Math.round(percentage),
      passed,
      questions: gradedQuestions
    };
  }
}

module.exports = new QuizGenerator();