const db = require("../models/index.js");
const { User } = db;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/email");

// POST /login
async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "Email doesn't exist" });
    }
    // Compare plain password with hashed password from DB
    const isValidPassword = await bcrypt.compare(password, user.hashPassword);
    if (!isValidPassword) {
      return res.status(400).json({ error: "Incorrect password" });
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    user.authToken = token;
    await user.save();
    // Success
    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// POST /users with hashed password....!
async function postUser(req, res) {
  try {
    const { name, email, password } = req.body;
    console.log("Received data:", { name, email, password });
    if (!password)
      return res.status(400).json({ error: "Password is required" });
    // Check if email exists
    const existsEmail = await User.findOne({ where: { email } });
    if (existsEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }
    // 🔐 HASH PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Save user with hashed password
    const user = await User.create({
      name,
      email,
      hashPassword: hashedPassword, // store hashed password
    });
    // console.log("User created:", user);
    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        // password not sent!
      },
    });
  } catch (err) {
    console.log({ error: err.message }, "posterror>>>>>>>>>>>>");
    return res.status(500).json({ error: err.message });
  }
}

// POST /users
// async function postUser(req, res) {
//   try {
//     const { name, email, password } = req.body;
//     console.log("Received data:", { name, email, password });
//     if (!password)
//       return res.status(400).json({ error: "Password is required" });
//     const existsEmail = await User.findOne({ where: { email } });
//     if (existsEmail) {
//       return res.status(400).json({ error: "Email already exists" });
//     }
//     const user = await User.create({ name, email, password });
//     console.log("User created:", user);
//     return res.status(201).json(user);
//   } catch (err) {
//     console.log({ error: err.message }, "posterrorrrrrr>>>>>>>>>>>>");
//     return res.status(500).json({ error: err.message });
//   }
// }

// GET /users
async function getUser(req, res) {
  try {
    const users = await User.findAll();
    // console.log(Users);
    return res.json(users);
  } catch (err) {
    console.log({ error: err.message }, "eerrrrrrrororor>>>>>>");
    return res.status(500).json({ error: err.message });
  }
}

// GET /users/:id
async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// PUT /users
async function updateUser(req, res) {
  try {
    const { id } = req.params; // get id from URL
    const { email, password } = req.body; // updated data
    if (!id)
      return res.status(400).json({ error: "id is required for update" });
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    await user.update({ id, email, password });
    return res.json(user);
  } catch (err) {
    console.log({ error: err.message }, "updateEerrrrrrrororor>>>>>>");
    return res.status(500).json({ error: err.message });
  }
}

// DELETE /users/:id
async function deleteUser(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    const deleted = await User.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: "User not found" });
    return res.json({ message: "User deleted" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
async function logoutUser(req, res) {
  try {
    const { id } = req.params;
    // 1. Find user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // 2. Remove token from DB
    user.authToken = "";
    await user.save();
    return res.json({ message: "Logout successful" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function resetPassword(req, res) {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findOne({ where: { email: decoded.email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

     // Update password + clear token
    await User.update(
      {
        hashPassword: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
      { where: { id: user.id } }
    );
    res.json({ message: "Password reset successful." });
  } catch (err) {
    res.status(500).json({ error: "Invalid or expired token." });
    console.log(err, "<reset error>")
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });
    // Create reset token (valid for 15 min)
    const expiryTime = Date.now() + 15 * 60 * 1000; // 15 minutes from nows
    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "30min",
    });
      await User.update(
      {
        resetToken: token,
        resetTokenExpiry: new Date(expiryTime),
      },
      { where: { email } }
    );
    // Create reset link for frontend
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    // Send email
    await sendEmail(
      email,
      "Reset Your Password",
      `
        <h3>Password Reset Request</h3>
        <p>Click the button below to reset your password:</p>
        <a href="${resetLink}" 
           style="padding:10px 15px;background:#4CAF50;color:#fff;text-decoration:none;">
           Reset Password
        </a>
        <p>This link expires in 15 minutes.</p>
      `
    );
    res.json({ message: "Password reset email sent." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  logoutUser,
  resetPassword,
  forgotPassword,
  loginUser,
  postUser,
  getUser,
  getUserById,
  updateUser,
  deleteUser,
};
