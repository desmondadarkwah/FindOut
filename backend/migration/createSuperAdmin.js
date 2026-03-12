const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const AdminModel = require('../models/AdminModel');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const createSuperAdmin = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected');

    const newEmail = 'desmondadarkwah48@gmail.com'; 
    const newPassword = 'desmond'; 
    const name = 'Super Admin';

    // ✅ DELETE ALL OLD ADMINS
    await AdminModel.deleteMany({});
    console.log('🗑️  Deleted old admins');

    // Hash password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Create new admin
    const admin = new AdminModel({
      name,
      email: newEmail,
      password: hashedPassword,
      isSuperAdmin: true
    });

    await admin.save();

    console.log('✅ Super Admin created successfully!');
    console.log('📧 Email:', newEmail);
    console.log('🔑 Password:', newPassword);
    console.log('⚠️  CHANGE THIS PASSWORD AFTER FIRST LOGIN!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createSuperAdmin();