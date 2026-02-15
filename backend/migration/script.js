// Migration script - run once
const mongoose = require('mongoose');
require('dotenv').config();
const GroupModel = require('../models/GroupModel');

async function fixGroupProfiles() {
  try {
    // ✅ Connect to MongoDB first
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI , {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Fetch all groups
    const groups = await GroupModel.find({});
    console.log(`Found ${groups.length} groups to check`);

    let fixedCount = 0;

    for (const group of groups) {
      if (group.groupProfile && group.groupProfile.includes('\\')) {
        // Extract filename from full path
        const filename = group.groupProfile.split('\\').pop();
        group.groupProfile = `/uploads/${filename}`;
        await group.save();
        console.log(`✅ Fixed: ${group.groupName} -> ${group.groupProfile}`);
        fixedCount++;
      } else if (group.groupProfile && !group.groupProfile.startsWith('/uploads/')) {
        // Fix profiles that don't start with /uploads/
        group.groupProfile = `/uploads/${group.groupProfile}`;
        await group.save();
        console.log(`✅ Fixed: ${group.groupName} -> ${group.groupProfile}`);
        fixedCount++;
      }
    }

    console.log(`\n✅ Migration completed! Fixed ${fixedCount} group profiles.`);
  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    // ✅ Close MongoDB connection
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  }
}

// Run the migration
fixGroupProfiles();