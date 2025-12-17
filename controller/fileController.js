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
      // path: `/api/uploads/${req.file.filename}`,
      // originalName: req.file.originalname,
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

// const db = require("../models/index.js");
// const { User } = db;

// async function profileImage(req, res) {
//   try {
//     console.log("req.file", req.file);

//     if (!req.file) {
//       console.log("req.file is undefined");
//       return res.status(400).json({ error: "Please upload an image" });
//     }

//     const userId = req.loginUser.id;
//     console.log("userId", userId);

//     const profileImage = {
//       filename: req.file.filename,
//       path: `/api/uploads/${req.file.filename}`,
//       originalName: req.file.originalname,
//     };

//     await User.update({ profileImage }, { where: { id: userId } });

//     return res.json({
//       message: "Profile picture updated successfully",
//       profileImage,
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ error: err.message });
//   }
// }

// async function updateProfileImage(req, res) {
//   try {
//     const userId = req.params.id;

//     // 1️⃣ Fetch existing record
//     const user = await User.findByPk(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // 2️⃣ Delete old file if exists
//     if (user.avatar) {
//       const oldFilePath = path.join(__dirname, "..", "uploads", user.avatar);

//       if (fs.existsSync(oldFilePath)) {
//         fs.unlinkSync(oldFilePath);
//       }
//     }

//     // 3️⃣ Save new file name
//     user.avatar = req.file.filename;
//     await user.save();

//     res.json({
//       message: "File updated successfully",
//       file: req.file.filename,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
