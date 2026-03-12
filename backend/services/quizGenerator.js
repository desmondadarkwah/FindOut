const Anthropic = require('@anthropic-ai/sdk');
const QuizModel = require('../models/QuizModel');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

class QuizGenerator {
  /**
   * Generate quiz questions for a subject using Claude AI
   */
  async generateQuiz(subject) {
    try {
      console.log(`🤖 Generating quiz for subject: ${subject}`);

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

      // Generate new quiz using Claude
      const prompt = this.buildQuizPrompt(subject);
      
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const responseText = message.content[0].text;
      
      // Parse the JSON response
      const questions = this.parseQuizResponse(responseText);

      if (!questions || questions.length !== 10) {
        throw new Error('Failed to generate valid quiz questions');
      }

      // Cache the quiz
      await QuizModel.create({
        subject,
        questions,
        timesUsed: 1
      });

      console.log(`✅ Generated and cached new quiz for ${subject}`);
      return questions;

    } catch (error) {
      console.error('Error generating quiz:', error);
      throw new Error('Failed to generate quiz questions');
    }
  }

  /**
   * Build the prompt for Claude to generate quiz questions
   */
  buildQuizPrompt(subject) {
    return `You are an expert educator creating a verification quiz for teachers who claim to teach "${subject}".

Generate EXACTLY 10 multiple-choice questions that test fundamental and intermediate knowledge of ${subject}.

Requirements:
- Questions should be clear and unambiguous
- Mix of difficulty: 4 easy, 4 medium, 2 hard
- Each question must have exactly 4 options (A, B, C, D)
- Only ONE correct answer per question
- Questions should cover different aspects of the subject
- Avoid trick questions or overly obscure topics
- Focus on practical teaching knowledge

Return your response as a valid JSON array with this EXACT structure:
[
  {
    "question": "What is the fundamental theorem of calculus?",
    "options": [
      "It relates differentiation and integration",
      "It proves all functions are continuous",
      "It defines the derivative",
      "It solves differential equations"
    ],
    "correctAnswer": 0,
    "difficulty": "medium",
    "explanation": "The fundamental theorem of calculus establishes the relationship between differentiation and integration."
  }
]

Important:
- correctAnswer is the index (0, 1, 2, or 3) of the correct option
- Return ONLY the JSON array, no markdown formatting, no backticks, no explanation text
- Ensure valid JSON syntax

Generate the quiz now:`;
  }

  /**
   * Parse Claude's response and extract quiz questions
   */
  parseQuizResponse(responseText) {
    try {
      // Remove markdown code blocks if present
      let cleanedText = responseText.trim();
      
      // Remove ```json and ``` if present
      cleanedText = cleanedText.replace(/```json\s*/g, '');
      cleanedText = cleanedText.replace(/```\s*/g, '');
      
      // Find the JSON array
      const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const questions = JSON.parse(jsonMatch[0]);

      // Validate questions
      if (!Array.isArray(questions) || questions.length !== 10) {
        throw new Error('Invalid number of questions');
      }

      // Validate each question
      questions.forEach((q, index) => {
        if (!q.question || !Array.isArray(q.options) || q.options.length !== 4) {
          throw new Error(`Invalid question at index ${index}`);
        }
        if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
          throw new Error(`Invalid correctAnswer at index ${index}`);
        }
      });

      return questions;

    } catch (error) {
      console.error('Error parsing quiz response:', error);
      console.error('Response text:', responseText);
      throw new Error('Failed to parse quiz questions');
    }
  }

  /**
   * Grade a quiz attempt
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