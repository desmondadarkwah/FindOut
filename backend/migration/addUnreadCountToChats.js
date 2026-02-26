require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

// ✅ FIXED: Import from the correct file
const { ChatModel } = require('../models/MessageModel');
const GroupModel = require('../models/GroupModel');

const addUnreadCountToChats = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // ─────────────────────────────────────────
    // FIX INDIVIDUAL CHATS (ChatModel)
    // ─────────────────────────────────────────
    console.log('📋 Checking individual chats (DMs)...');
    
    const chatsWithoutUnread = await ChatModel.find({
      $or: [
        { unreadCount: { $exists: false } },
        { unreadCount: null },
        { unreadCount: [] }
      ]
    });

    console.log(`Found ${chatsWithoutUnread.length} individual chats needing unreadCount`);

    for (const chat of chatsWithoutUnread) {
      // Initialize unread count for all participants
      const unreadCount = chat.participants.map(userId => ({
        userId,
        count: 0
      }));

      await ChatModel.updateOne(
        { _id: chat._id },
        { $set: { unreadCount } }
      );

      console.log(`✅ Fixed chat ${chat._id} (${chat.participants.length} participants)`);
    }

    // ─────────────────────────────────────────
    // FIX GROUP CHATS (GroupModel)
    // ─────────────────────────────────────────
    console.log('\n📋 Checking group chats...');
    
    const groupsWithoutUnread = await GroupModel.find({
      $or: [
        { unreadCount: { $exists: false } },
        { unreadCount: null },
        { unreadCount: [] }
      ]
    });

    console.log(`Found ${groupsWithoutUnread.length} groups needing unreadCount`);

    for (const group of groupsWithoutUnread) {
      // Initialize unread count for all members
      const unreadCount = group.members.map(userId => ({
        userId,
        count: 0
      }));

      await GroupModel.updateOne(
        { _id: group._id },
        { $set: { unreadCount } }
      );

      console.log(`✅ Fixed group ${group._id} - ${group.groupName} (${group.members.length} members)`);
    }

    console.log('\n✅ Migration completed successfully!');
    console.log(`   - Fixed ${chatsWithoutUnread.length} individual chats`);
    console.log(`   - Fixed ${groupsWithoutUnread.length} group chats`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔒 Database connection closed');
    process.exit(0);
  }
};

addUnreadCountToChats();