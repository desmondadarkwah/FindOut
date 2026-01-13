const GroupModel = require("../models/GroupModel");

const FetchAllGroups = async (req, res) => {
  try {
    const userId = req.authenticatedUser.id;
    const groups =await GroupModel.find({ groupAdmin: userId }).populate('members', 'name')

    if(!groups){
      return res.status(404).json({ message: 'No groups Yet' })
    }
    res.status(200).json(groups)
  } catch (error) {
    console.error('Error fetching groups', error);
    res.status(500).json({ message: 'Error fetching groups', error });
  }
}

module.exports = FetchAllGroups;