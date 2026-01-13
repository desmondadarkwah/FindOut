const express = require('express');
const UserModel = require('../models/UserModel');

const EditUserDetails = async (req, res) => {
  try {
    const userId = req.authenticatedUser.id;
    const updates = req.body; 

    const allowedFields = ['name', 'profilePicture', 'status', 'subjects']; 
    const isValidUpdate = Object.keys(updates).every((key) => allowedFields.includes(key));

    if (!isValidUpdate) {
      return res.status(400).json({ message: 'Invalid fields in update request.' });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(userId, updates, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      message: 'User details updated successfully.',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({ message: 'Error updating user details.', error: error.message });
  }
};

module.exports = EditUserDetails;
