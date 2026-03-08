const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const AdminModel = require('../models/AdminModel');
const path = require('path');

// require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const createSuperAdmin = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected');

    const email = 'desmondadarkwah48@gmail.com'; // Change this
    const password = 'desmond'; // Change this
    const name = 'Super Admin';

    // Check if admin exists
    const existing = await AdminModel.findOne({ email });
    if (existing) {
      console.log('❌ Admin already exists with this email');
      process.exit(1);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const admin = new AdminModel({
      name,
      email,
      password: hashedPassword,
      isSuperAdmin: true
    });

    await admin.save();

    console.log('✅ Super Admin created successfully!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('⚠️  CHANGE THIS PASSWORD AFTER FIRST LOGIN!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createSuperAdmin();