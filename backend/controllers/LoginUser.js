const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'access_token_secret';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_token_secret';

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' }); // Short-lived
  const refreshToken = jwt.sign({ id: userId }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' }); // Long-lived
  return { accessToken, refreshToken };
};

const LoginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const findUser = await UserModel.findOne({ email });

    if (!findUser) {
      return res.status(400).json({
        message: 'User not found',
      });
    }

    if (!findUser.isVerified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in.',
      });
    }

    const isMatch = await bcrypt.compare(password, findUser.password);

    if (!isMatch) {
      return res.status(400).json({
        message: 'Invalid credentials',
      });
    }

    const { accessToken, refreshToken } = generateTokens(findUser._id);

    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: findUser._id,
        name: findUser.name,
        email: findUser.email,
      },
      accessToken, 
      refreshToken, 
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
