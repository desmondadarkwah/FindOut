const VerificationModel = require('../models/VerificationModel');
const UserModel = require('../models/UserModel');
const quizGenerator = require('../services/quizGenerator');

// ═══════════════════════════════════════════════════════════════
// GET VERIFICATION STATUS
// ═══════════════════════════════════════════════════════════════

const GetVerificationStatus = async (req, res) => {
  try {
    const userId = req.authenticatedUser.id;

    // Get user's subjects
    const user = await UserModel.findById(userId).select('subjects isVerified verifiedSubjects');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get all verification records for this user
    const verifications = await VerificationModel.find({ userId });

    // Build status for each subject
    const subjectStatus = user.subjects.map(subject => {
      const verification = verifications.find(v => v.subject === subject);

      if (!verification) {
        return {
          subject,
          status: 'not_started',
          isVerified: false,
          canTakeQuiz: true,
          attemptsRemaining: 3
        };
      }

      return {
        subject,
        status: verification.isVerified ? 'verified' : 'in_progress',
        isVerified: verification.isVerified,
        canTakeQuiz: verification.canTakeQuiz(),
        attemptsRemaining: verification.maxAttempts - verification.totalAttempts,
        totalAttempts: verification.totalAttempts,
        bestScore: verification.bestScore,
        verifiedAt: verification.verifiedAt
      };
    });

    res.json({
      success: true,
      isVerified: user.isVerified,
      verifiedSubjects: user.verifiedSubjects || [],
      subjectStatus
    });

  } catch (error) {
    console.error('Get verification status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get verification status'
    });
  }
};

// ═══════════════════════════════════════════════════════════════
// START QUIZ (Generate Questions)
// ═══════════════════════════════════════════════════════════════

const StartQuiz = async (req, res) => {
  try {
    const userId = req.authenticatedUser.id;
    const { subject } = req.body;

    if (!subject) {
      return res.status(400).json({
        success: false,
        message: 'Subject is required'
      });
    }

    // Check if user has this subject
    const user = await UserModel.findById(userId);
    if (!user.subjects.includes(subject)) {
      return res.status(400).json({
        success: false,
        message: 'You have not listed this subject in your profile'
      });
    }

    // Check if user can take quiz
    let verification = await VerificationModel.findOne({ userId, subject });

    if (!verification) {
      // Create new verification record
      verification = new VerificationModel({
        userId,
        subject
      });
      await verification.save();
    }

    if (!verification.canTakeQuiz()) {
      return res.status(400).json({
        success: false,
        message: verification.isVerified
          ? 'You are already verified for this subject'
          : 'Maximum attempts reached. Please contact support.',
        verification: {
          isVerified: verification.isVerified,
          totalAttempts: verification.totalAttempts,
          maxAttempts: verification.maxAttempts
        }
      });
    }

    // Generate quiz questions
    const questions = await quizGenerator.generateQuiz(subject);

    // Remove correct answers from response (send to client without answers)
    const questionsForClient = questions.map(q => ({
      question: q.question,
      options: q.options,
      difficulty: q.difficulty
    }));

    // Store questions temporarily (we'll need them for grading)
    const quizSessionId = `${userId}_${subject}_${Date.now()}`;

    res.json({
      success: true,
      quizSessionId,
      subject,
      questions: questionsForClient,
      totalQuestions: 10,
      passingScore: 70,
      timeLimit: 600, // 10 minutes in seconds
      attemptsRemaining: verification.maxAttempts - verification.totalAttempts
    });

    // Store the full questions temporarily for grading
    global.activeQuizSessions = global.activeQuizSessions || {};
    global.activeQuizSessions[quizSessionId] = {
      questions,
      startTime: Date.now(),
      subject,
      userId
    };

  } catch (error) {
    console.error('Start quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start quiz. Please try again.'
    });
  }
};

// ═══════════════════════════════════════════════════════════════
// SUBMIT QUIZ (Grade Answers)
// ═══════════════════════════════════════════════════════════════

const SubmitQuiz = async (req, res) => {
  try {
    const userId = req.authenticatedUser.id;
    const { quizSessionId, answers } = req.body;

    if (!quizSessionId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quiz submission'
      });
    }

    // Get the quiz session
    global.activeQuizSessions = global.activeQuizSessions || {};
    const session = global.activeQuizSessions[quizSessionId];

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Quiz session not found or expired'
      });
    }

    if (session.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Calculate time spent
    const timeSpent = Math.floor((Date.now() - session.startTime) / 1000);

    // Grade the quiz
    const result = quizGenerator.gradeQuiz(session.questions, answers);

    // Update verification record
    const verification = await VerificationModel.findOne({
      userId,
      subject: session.subject
    });

    verification.addAttempt({
      score: result.score,
      totalQuestions: result.totalQuestions,
      percentage: result.percentage,
      passed: result.passed,
      questions: result.questions,
      timeSpent
    });

    await verification.save();

    // Update user's verification status if passed
    if (result.passed) {
      const user = await UserModel.findById(userId);
      
      // Add to verifiedSubjects if not already there
      const alreadyVerified = user.verifiedSubjects?.some(
        vs => vs.subject === session.subject
      );

      if (!alreadyVerified) {
        if (!user.verifiedSubjects) user.verifiedSubjects = [];
        user.verifiedSubjects.push({
          subject: session.subject,
          verifiedAt: new Date()
        });
      }

      // Set overall verified status if not already verified
      if (!user.isVerified) {
        user.isVerified = true;
      }

      await user.save();
    }

    // Clean up session
    delete global.activeQuizSessions[quizSessionId];

    res.json({
      success: true,
      result: {
        score: result.score,
        totalQuestions: result.totalQuestions,
        percentage: result.percentage,
        passed: result.passed,
        timeSpent,
        questions: result.questions
      },
      verification: {
        isVerified: verification.isVerified,
        verifiedAt: verification.verifiedAt,
        totalAttempts: verification.totalAttempts,
        attemptsRemaining: verification.maxAttempts - verification.totalAttempts,
        canRetake: verification.canRetake
      }
    });

  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz'
    });
  }
};

// ═══════════════════════════════════════════════════════════════
// GET QUIZ HISTORY
// ═══════════════════════════════════════════════════════════════

const GetQuizHistory = async (req, res) => {
  try {
    const userId = req.authenticatedUser.id;
    const { subject } = req.query;

    let filter = { userId };
    if (subject) {
      filter.subject = subject;
    }

    const verifications = await VerificationModel.find(filter)
      .select('subject attempts isVerified verifiedAt totalAttempts bestScore')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      verifications
    });

  } catch (error) {
    console.error('Get quiz history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get quiz history'
    });
  }
};

module.exports = {
  GetVerificationStatus,
  StartQuiz,
  SubmitQuiz,
  GetQuizHistory
};