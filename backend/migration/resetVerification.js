const mongoose = require('mongoose');
const UserModel = require('../models/UserModel');
const VerificationModel = require('../models/VerificationModel');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const resetAllVerifications = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📊 Connected to MongoDB\n');

    // Reset UserModel
    const userResult = await UserModel.updateMany(
      {},
      {
        $set: {
          isVerified: false,
          verifiedSubjects: []
        }
      }
    );

    console.log(`✅ Reset ${userResult.modifiedCount} users in UserModel`);

    // Delete ALL verification records
    const verificationResult = await VerificationModel.deleteMany({});
    
    console.log(`✅ Deleted ${verificationResult.deletedCount} verification records`);
    console.log('✅ All quiz attempts and verifications have been cleared!');
    console.log('✅ Users can now take fresh quizzes!\n');
    
    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

resetAllVerifications();