const bcrypt = require('bcryptjs');
const UserModel = require('../models/UserModel');

const RegisterUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const profilePicture = req.file ? req.file.path : null;

    // Check if email already exists
    const existingUserMail = await UserModel.findOne({ email });

    if (existingUserMail) {
      return res.status(400).json({
        message: 'Email already exists',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const payload = {
      name,
      email,
      password: hashedPassword,
      profilePicture,

      // Email verification is temporarily disabled
      isEmailVerified: true,

      // KEEP quiz/teacher verification separate
      isVerified: false,
    };

    const newUser = new UserModel(payload);

    await newUser.save();

    // No verification email during presentation

    res.status(201).json({
      message: 'User registered successfully!',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        profilePicture: newUser.profilePicture,
      }
    });

  } catch (error) {
    console.error("Registration error: ", error);

    res.status(500).json({
      message: 'Registration failed.',
      error: error.message
    });
  }
};

module.exports = RegisterUser;