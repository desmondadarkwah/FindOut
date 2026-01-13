const UserModel = require("../models/UserModel");

const GetUserDetails = async (req, res) => {
  try {
    const userId = req.authenticatedUser.id;
    // const accessToken = req.authenticatedUser.accessToken;
    // const refreshToken = req.authenticatedUser.refreshToken

    const user = await UserModel.findById(userId, "name email profilePicture subjects status");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }


    res.status(200).json(user);
    // res.status(200).json({ user, accessToken, refreshToken });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

module.exports = GetUserDetails;
