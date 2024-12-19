const express = require('express');
const GroupModel = require('../models/GroupModel');

const RemoveGroupMember = async (req, res) => {
  const { groupId, memberId } = req.body;

  try {
    const findGroupToEdit = await GroupModel.findById(groupId);

    if (!findGroupToEdit) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (req.authenticatedUser.id !== findGroupToEdit.groupAdmin.toString()) {
      return res.status(403).json({ message: 'Unauthorized to edit this group' });
    }

    findGroupToEdit.members = findGroupToEdit.members.filter(
      (member) => member.toString() !== memberId
    );

    await findGroupToEdit.save();

    res.status(200).json({ message: 'Member removed successfully', group: findGroupToEdit });

  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({ message: 'Error removing member from group', error });
  }
};

module.exports = RemoveGroupMember;
