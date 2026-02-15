// cleanup-direct.js
const mongoose = require('mongoose');
const PostModel = require('../models/PostModel');

// Direct connection string (temporary for cleanup)
const MONGODB_URI = 'mongodb+srv://desmondadarkwah48:finder@cluster0.vnndu.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';

// Direct database connection
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

// Database cleanup script to remove invalid likes
const cleanupInvalidLikes = async () => {
  try {
    console.log('Starting cleanup of invalid likes...');
    
    const posts = await PostModel.find({});
    let totalCleaned = 0;
    let postsProcessed = 0;
    
    console.log(`Found ${posts.length} posts to check`);
    
    for (const post of posts) {
      let postModified = false;
      
      // Clean up post likes
      const originalPostLikesCount = post.likes.length;
      post.likes = post.likes.filter(like => like && like.user);
      if (post.likes.length !== originalPostLikesCount) {
        post.likeCount = post.likes.length;
        postModified = true;
        totalCleaned += (originalPostLikesCount - post.likes.length);
        console.log(`Post ${post._id}: Removed ${originalPostLikesCount - post.likes.length} invalid post likes`);
      }
      
      // Clean up comment likes
      for (const comment of post.comments) {
        if (comment.likes && comment.likes.length > 0) {
          const originalCommentLikesCount = comment.likes.length;
          comment.likes = comment.likes.filter(like => like && like.user);
          if (comment.likes.length !== originalCommentLikesCount) {
            postModified = true;
            const cleanedCount = originalCommentLikesCount - comment.likes.length;
            totalCleaned += cleanedCount;
            console.log(`Comment ${comment._id}: Removed ${cleanedCount} invalid comment likes`);
          }
        }
      }
      
      if (postModified) {
        await post.save();
        console.log(`✓ Cleaned and saved post ${post._id}`);
      }
      
      postsProcessed++;
      if (postsProcessed % 10 === 0) {
        console.log(`Progress: ${postsProcessed}/${posts.length} posts processed`);
      }
    }
    
    console.log('\n=== CLEANUP SUMMARY ===');
    console.log(`Posts processed: ${postsProcessed}`);
    console.log(`Total invalid likes removed: ${totalCleaned}`);
    console.log('Cleanup completed successfully!');
    
  } catch (error) {
    console.error('Error during cleanup:', error);
    throw error;
  }
};

// Main execution function
const runCleanup = async () => {
  try {
    await connectDB();
    await cleanupInvalidLikes();
  } catch (error) {
    console.error('Cleanup failed:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  }
};

// Run the cleanup
runCleanup();