const express = require('express');
const bcrypt = require('bcryptjs');
const UserModel = require('../models/UserModel');
const { sendVerificationEmail } = require('./VerifyEmail');

const RegisterUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const profilePicture = req.file ? req.file.path : null;

    const existingUserMail = await UserModel.findOne({ email });

    if (existingUserMail) {
      if (!existingUserMail.isVerified) {
        return res.status(400).json({
          message: 'Email already registered but not verified. Please verify your email or request a new verification link.',
        });
      }
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const payload = {
      name,
      email,
      password: hashedPassword,
      profilePicture,
      isVerified: false,
    };

    const newUser = new UserModel(payload);
    await newUser.save();

    await sendVerificationEmail(email);

    res.status(201).json({
      message: 'User registered successfully! Please check your email for verification.',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        profilePicture: newUser.profilePicture,
      }
    });
  } catch (error) {
    console.error("Registration error: ", error);
    res.status(500).json({ message: 'Registration failed.', error: error.message });
  }
};


module.exports = RegisterUser;
