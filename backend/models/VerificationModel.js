const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  // Quiz attempt details
  attempts: [{
    attemptNumber: {
      type: Number,
      required: true
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 10
    },
    totalQuestions: {
      type: Number,
      default: 10
    },
    percentage: {
      type: Number,
      required: true
    },
    passed: {
      type: Boolean,
      required: true
    },
    questions: [{
      question: String,
      options: [String],
      correctAnswer: Number,
      userAnswer: Number,
      isCorrect: Boolean
    }],
    completedAt: {
      type: Date,
      default: Date.now
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0
    }
  }],
  // Verification status
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date
  },
  // Best attempt
  bestScore: {
    type: Number,
    default: 0
  },
  totalAttempts: {
    type: Number,
    default: 0
  },
  // Limits
  maxAttempts: {
    type: Number,
    default: 3
  },
  canRetake: {
    type: Boolean,
    default: true
  },
  nextRetakeAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for faster queries
verificationSchema.index({ userId: 1, subject: 1 }, { unique: true });
verificationSchema.index({ userId: 1, isVerified: 1 });

// Methods
verificationSchema.methods.addAttempt = function(attemptData) {
  this.totalAttempts += 1;
  this.attempts.push({
    attemptNumber: this.totalAttempts,
    ...attemptData
  });

  // Update best score
  if (attemptData.score > this.bestScore) {
    this.bestScore = attemptData.score;
  }

  // Check if passed (70% threshold)
  if (attemptData.passed && !this.isVerified) {
    this.isVerified = true;
    this.verifiedAt = new Date();
  }

  // Check if can retake (max 3 attempts)
  if (this.totalAttempts >= this.maxAttempts) {
    this.canRetake = false;
  }
};

verificationSchema.methods.getLatestAttempt = function() {
  return this.attempts[this.attempts.length - 1];
};

verificationSchema.methods.canTakeQuiz = function() {
  if (this.isVerified) return false; // Already verified
  if (!this.canRetake) return false; // Max attempts reached
  if (this.nextRetakeAt && new Date() < this.nextRetakeAt) return false; // Cooldown active
  return true;
};

const VerificationModel = mongoose.model('Verification', verificationSchema);

module.exports = VerificationModel;