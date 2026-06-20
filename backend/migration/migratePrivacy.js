const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });


const GroupModel = require('../models/GroupModel');

const migratePrivacy = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📊 Connected to MongoDB\n');

    // Convert old isPrivate: true → privacy: 'private'
    const privateResult = await GroupModel.updateMany(
      { isPrivate: true },
      { $set: { privacy: 'private' }, $unset: { isPrivate: '' } }
    );
    console.log(`✅ Migrated ${privateResult.modifiedCount} private groups`);

    // Convert old isPrivate: false → privacy: 'public'
    const publicResult = await GroupModel.updateMany(
      { isPrivate: false },
      { $set: { privacy: 'public' }, $unset: { isPrivate: '' } }
    );
    console.log(`✅ Migrated ${publicResult.modifiedCount} public groups`);

    // Groups with no isPrivate field at all → default to 'public'
    const noFieldResult = await GroupModel.updateMany(
      { privacy: { $exists: false } },
      { $set: { privacy: 'public' } }
    );
    console.log(`✅ Fixed ${noFieldResult.modifiedCount} groups with no privacy field`);

    console.log('\n✅ Migration complete!');
    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
};

migratePrivacy();