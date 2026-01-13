const UserModel = require("../models/UserModel");


const Logout = async (req, res) => {
  try {
    const { id } = req.authenticatedUser;

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    // await BlacklistedToken.create({ token: refreshToken });
    user.refreshToken = null
    await user.save()

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Error during logout", error: error.message });
  }
};

module.exports = Logout;