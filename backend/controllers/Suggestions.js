const UserModel = require("../models/UserModel");
const GroupModel = require("../models/GroupModel");

const Suggestions = async (req, res) => {
  try {
    const { id } = req.authenticatedUser; 
    const user = await UserModel.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let targetStatus = [];
    if (user.status === "Ready To Learn") {
      targetStatus.push("Ready To Teach");
    } else if (user.status === "Ready To Teach") {
      targetStatus.push("Ready To Learn");
    }

    const suggestedUsers = await UserModel.find({
      _id: { $ne: id }, 
      $or: [
        { status: { $in: targetStatus } }, 
        { subjects: { $in: user.subjects } }, 
      ],
    }).select("name status subjects profilePicture");

  
    const suggestedGroups = await GroupModel.find({
      subjects: { $in: user.subjects }, 
      members: { $ne: id }, 
    }).select("groupProfile groupName subjects");

    res.status(200).json({ suggestedUsers, suggestedGroups });
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    res.status(500).json({ message: "Error fetching suggestions" });
  }
};

module.exports = Suggestions;
