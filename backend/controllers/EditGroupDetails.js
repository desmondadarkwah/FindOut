const express = require('express')
const GroupModel = require('../models/GroupModel')

const EditGroupDetails = async (req,res) =>{
  try{
    const { groupId, groupName, description, meetingTime, subjects } = req.body;

    const findGroupToEdit = await GroupModel.findById(groupId);


    if (!findGroupToEdit) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (req.authenticatedUser.id !== findGroupToEdit.groupAdmin.toString()) {
      return res.status(403).json({ message: 'Unauthorized to edit this group' });
    }

    findGroupToEdit.groupName = groupName || findGroupToEdit.groupName;
    findGroupToEdit.description = description || findGroupToEdit.description;
    findGroupToEdit.meetingTime = meetingTime || findGroupToEdit.meetingTime;
    findGroupToEdit.subjects = subjects || findGroupToEdit.subjects;

const updatedGroup = await findGroupToEdit.save();

res.status(200).json({
  message: 'Group details updated successfully',
  group: updatedGroup,
});

  }catch (error) {
    console.error('Error is: ', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = EditGroupDetails;
