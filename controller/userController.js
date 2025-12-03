const db = require("../models/index.js");
const { User } = db;

// POST /login
async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "Email doesn't exist" });
    }
    if (user.password !== password) {
      return res.status(400).json({ error: "Password doesn't exist" });
    }
    // Success - later you can replace this with JWT
    return res.json({ message: "Login successful", user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// POST /users
async function postUser(req, res) {
  try {
    const { name, email, password } = req.body;
    console.log("Received data:", { name, email, password });
    if (!password)
      return res.status(400).json({ error: "Password is required" });
    const existsEmail = await User.findOne({ where: { email } });
    if (existsEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }
    const user = await User.create({ name, email, password });
    console.log("User created:", user);
    return res.status(201).json(user);
  } catch (err) {
    console.log({ error: err.message }, "posterrorrrrrr>>>>>>>>>>>>");
    return res.status(500).json({ error: err.message });
  }
}

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

module.exports = {
  loginUser,
  postUser,
  getUser,
  getUserById,
  updateUser,
  deleteUser,
};
