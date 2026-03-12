const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  GetVerificationStatus,
  StartQuiz,
  SubmitQuiz,
  GetQuizHistory
} = require('../controllers/verificationController');

// All routes require authentication
router.use(authMiddleware);

// Verification routes
router.get('/verification/status', GetVerificationStatus);
router.post('/verification/start-quiz', StartQuiz);
router.post('/verification/submit-quiz', SubmitQuiz);
router.get('/verification/history', GetQuizHistory);

module.exports = router;