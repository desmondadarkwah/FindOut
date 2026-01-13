const GroupModel = require('../models/GroupModel')

const GetGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await GroupModel.findById(groupId).populate('members','name')

    if (!group) {
      return res.status(404).json({ message: 'Group not found' })
    }
    console.log(groupId)

    res.status(200).json({
      groupName: group.groupName,
      subjects: group.subjects,
      description: group.description,
      meetingTime: group.meetingTime,
      groupMembers:group.members
        });
  } catch (error) {
    console.error("Error details:", error);
    res.status(500).json({ message: 'Error fetching group details', error });
  }
}

module.exports = GetGroupDetails;