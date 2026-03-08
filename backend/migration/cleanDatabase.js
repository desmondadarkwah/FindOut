const mongoose = require('mongoose');
const path = require('path');

// ✅ Load .env from parent directory (backend folder)
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const PostModel = require('../models/PostModel');
const UserModel = require('../models/UserModel');

const cleanDatabase = async () => {
  try {
    console.log('📁 Looking for MongoDB URI...');
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in .env file');
      console.log('💡 Make sure your .env file is in the backend folder');
      process.exit(1);
    }

    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete all old posts
    const deleteResult = await PostModel.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} old posts`);

    // Add reputation field to all users
    const updateResult = await UserModel.updateMany(
      { reputation: { $exists: false } },
      { $set: { reputation: 0 } }
    );
    console.log(`✅ Updated ${updateResult.modifiedCount} users with reputation field`);

    console.log('🎉 Database cleaned successfully!');
    await mongoose.connection.close();
    console.log('👋 Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    process.exit(1);
  }
};

cleanDatabase();

