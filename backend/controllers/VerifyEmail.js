const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');
const nodemailer = require('nodemailer');

const sendVerificationEmail = async (email) => {
  try {
    const user = await UserModel.findOne({ email });
    if (!user) throw new Error('User not found');

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your FindOut email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Welcome to FindOut! 🎓</h2>
          <p>Please verify your email address to get started.</p>
          <a href="${verificationLink}" 
             style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Verify Email
          </a>
          <p style="color: #666; margin-top: 16px;">This link expires in 24 hours.</p>
          <p style="color: #666;">If you didn't create an account, ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { status: 200, message: 'Verification email sent' };
  } catch (error) {
    console.error(error);
    return { status: 500, message: 'Error sending verification email', error: error.message };
  }
};

const VerifyEmail = async (req, res) => {
  try {
    const token = req.query.token;

    if (!token) {
      return res.status(400).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ✅ Only set email verification - NOT quiz verification
    user.isEmailVerified = true;
    await user.save();

    res.status(200).json({ message: 'Email successfully verified' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};

module.exports = { sendVerificationEmail, VerifyEmail };