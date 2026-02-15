const mongoose = require('mongoose');
const GroupModel = require('../models/GroupModel');
const crypto = require('crypto');
const path = require('path');

// ✅ Load .env from parent directory
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const addInviteCodes = async () => {
  try {
    // ✅ Check if MONGODB_URI exists
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in .env file');
      console.log('💡 Make sure your .env file has: MONGODB_URI=your_connection_string');
      process.exit(1);
    }

    console.log('🔗 Connecting to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find all groups without invite codes
    const groupsWithoutCodes = await GroupModel.find({
      $or: [
        { inviteCode: { $exists: false } },
        { inviteCode: null },
        { inviteCode: '' }
      ]
    });

    console.log(`📊 Found ${groupsWithoutCodes.length} groups without invite codes`);

    if (groupsWithoutCodes.length === 0) {
      console.log('✅ All groups already have invite codes!');
      process.exit(0);
    }

    // Add invite codes
    let count = 0;
    for (const group of groupsWithoutCodes) {
      const inviteCode = crypto.randomBytes(8).toString('hex');
      
      // Use updateOne to avoid validation issues
      await GroupModel.updateOne(
        { _id: group._id },
        { $set: { inviteCode: inviteCode } }
      );
      
      count++;
      console.log(`✅ [${count}/${groupsWithoutCodes.length}] Added invite code to: ${group.groupName} (${inviteCode})`);
    }

    console.log('🎉 Migration complete!');
    console.log(`📊 Updated ${count} groups`);
    
    // Close connection
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

addInviteCodes();