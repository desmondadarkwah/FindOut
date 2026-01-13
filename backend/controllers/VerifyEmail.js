const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel')
const nodemailer = require('nodemailer')

const sendVerificationEmail = async (email) => {
  try {

    const user = await UserModel.findOne({ email })

      if (!user) {
        throw new Error('User not found');
      }    

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1m' });


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
      subject: 'please verify your email',
      html: `<p>Click <a href="${verificationLink}">here</a> to verify your email address.</p>`,
    }

    await transporter.sendMail(mailOptions)
    return { status: 200, message: 'Verification email sent' };  

  } catch (error) {
    console.error(error);
    return { status: 500, message: 'Error sending verification email', error: error.message };
  }
};

const VerifyEmail = async (req,res) => {
  try {
    const token = req.query.token;

    if (!token) {
      return res.status(400).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isVerified = true
    await user.save()

    res.status(200).json({ message: 'Email successfully verified' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};

module.exports = {
  sendVerificationEmail,
  VerifyEmail,
};