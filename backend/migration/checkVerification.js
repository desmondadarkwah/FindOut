const mongoose = require('mongoose');
const UserModel = require('../models/UserModel');
const path = require('path');

// ✅ Load .env from parent directory
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const checkVerificationStatus = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📊 Connected to MongoDB\n');

    const totalUsers = await UserModel.countDocuments();
    const verifiedUsers = await UserModel.countDocuments({ isVerified: true });
    const unverifiedUsers = await UserModel.countDocuments({ isVerified: false });
    const noFieldUsers = await UserModel.countDocuments({ isVerified: { $exists: false } });

    console.log('=== VERIFICATION STATUS ===');
    console.log(`Total users: ${totalUsers}`);
    console.log(`Verified (isVerified: true): ${verifiedUsers}`);
    console.log(`Unverified (isVerified: false): ${unverifiedUsers}`);
    console.log(`No field (missing isVerified): ${noFieldUsers}`);
    console.log('===========================\n');

    console.log('=== SAMPLE USERS ===');
    const sampleUsers = await UserModel.find()
      .select('name email isVerified verifiedSubjects')
      .limit(5)
      .lean();

    sampleUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   isVerified: ${user.isVerified}`);
      console.log(`   verifiedSubjects: ${JSON.stringify(user.verifiedSubjects || [])}`);
      console.log('');
    });

    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkVerificationStatus();