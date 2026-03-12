const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    options: [{
      type: String,
      required: true
    }],
    correctAnswer: {
      type: Number,
      required: true,
      min: 0,
      max: 3
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    explanation: {
      type: String
    }
  }],
  // Cache metadata
  generatedAt: {
    type: Date,
    default: Date.now
  },
  timesUsed: {
    type: Number,
    default: 0
  },
  // Expire cached quizzes after 7 days
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  }
}, {
  timestamps: true
});

// Index for subject lookup
quizSchema.index({ subject: 1, expiresAt: 1 });

// Auto-delete expired quizzes
quizSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const QuizModel = mongoose.model('Quiz', quizSchema);

module.exports = QuizModel;