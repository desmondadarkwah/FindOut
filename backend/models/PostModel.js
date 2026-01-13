const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: String,
    required: true
  },
  caption: {
    type: String,
    maxlength: 500,
    default: ''
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      maxlength: 300
    },
    likes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    // Add replies array to each comment
    replies: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      text: {
        type: String,
        required: true,
        maxlength: 300
      },
      likes: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }],
      likeCount: {
        type: Number,
        default: 0
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    likeCount: {
      type: Number,
      default: 0
    },
    replyCount: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  likeCount: {
    type: Number,
    default: 0
  },
  commentCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Add indexes for better performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ 'comments.user': 1 });
postSchema.index({ 'comments.replies.user': 1 });

// Virtual for total engagement (likes + comments + replies)
postSchema.virtual('engagementCount').get(function() {
  const totalReplies = this.comments.reduce((sum, comment) => sum + (comment.replyCount || 0), 0);
  return this.likeCount + this.commentCount + totalReplies;
});

// Ensure virtual fields are serialized
postSchema.set('toJSON', { virtuals: true });

const PostModel = mongoose.model('Post', postSchema);
module.exports = PostModel;





// const mongoose = require('mongoose');

// const postSchema = new mongoose.Schema({
//   author: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   image: {
//     type: String,
//     required: true
//   },
//   caption: {
//     type: String,
//     maxlength: 500,
//     default: ''
//   },
//   likes: [{
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User'
//     },
//     createdAt: {
//       type: Date,
//       default: Date.now
//     }
//   }],
//   comments: [{
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true
//     },
//     text: {
//       type: String,
//       required: true,
//       maxlength: 300
//     },
//     likes: [{
//       user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User'
//       },
//       createdAt: {
//         type: Date,
//         default: Date.now
//       }
//     }],
//     createdAt: {
//       type: Date,
//       default: Date.now
//     }
//   }],
//   likeCount: {
//     type: Number,
//     default: 0
//   },
//   commentCount: {
//     type: Number,
//     default: 0
//   }
// }, {
//   timestamps: true
// });

// const PostModel = mongoose.model('Post', postSchema);
// module.exports = PostModel;