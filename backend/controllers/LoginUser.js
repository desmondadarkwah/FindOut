const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');

const TOKEN_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const LoginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const findUser = await UserModel.findOne({ email });

    if (!findUser) {
      return res.status(400).json({
        message: 'User not found',
      });
    }

    const isMatch = await bcrypt.compare(password, findUser.password);

    if (!isMatch) {
      return res.status(400).json({
        message: 'Invalid credentials',
      });
    }

    // Generate JWT token
    const token = jwt.sign({ id: findUser._id }, TOKEN_SECRET, { expiresIn: '1d' });

    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: findUser._id,
        name: findUser.name,
        email: findUser.email,
      },
      token, 
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = LoginUser;
