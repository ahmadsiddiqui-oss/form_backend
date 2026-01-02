const fs = require("fs");
const path = require("path");
const db = require("../models/index.js");
const { User } = db;  

async function addProfileImage(req, res) {
  try {
    console.log("req.file", req.file);

    if (!req.file) {
      return res.status(400).json({ error: "Please upload an image" });
    }

    const userId = req.loginUser.id;

    // 1️⃣ Fetch existing user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2️⃣ Delete old file if exists
    if (user.profileImage?.filename) {
      const oldFilePath = path.join(
        __dirname,
        "..",
        "uploads",
        user.profileImage.filename
      );

      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // 3️⃣ Your existing logic (UNCHANGED)
    const profileImage = {
      filename: req.file.filename,
    };

    await User.update({ profileImage }, { where: { id: userId } });

    return res.json({
      message: "Profile picture updated successfully",
      profileImage,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
module.exports = { addProfileImage };
