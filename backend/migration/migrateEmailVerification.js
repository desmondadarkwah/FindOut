const mongoose = require('mongoose');
require('dotenv').config();

const migrateEmailVerification = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const result = await mongoose.connection.collection('users').updateMany(
      {}, // all users
      { $set: { isEmailVerified: true } }
    );

    console.log(`✅ Migration complete!`);
    console.log(`📊 Users updated: ${result.modifiedCount}`);
    console.log(`📊 Users matched: ${result.matchedCount}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

migrateEmailVerification();