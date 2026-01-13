const GroupModel = require("../models/GroupModel");


const DeleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await GroupModel.findByIdAndDelete(groupId)


    if (!group) {
      return res.status(404).json({ message: 'Group not found' })
    }

    res.status(200).json({ message: 'group deleted successfully' })
  } catch (error) {
    console.error('Error fetching groups', error);
    res.status(500).json({ message: 'Error fetching groups', error });
  }
}

module.exports = DeleteGroup;