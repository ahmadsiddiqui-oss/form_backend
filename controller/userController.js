const db = require("../models/index.js");
const { User, Role, Permission, Author, Book } = db;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/email");
const paginate = require("../utils/paginate.js");
const { getUserPermissions } = require("../middlewares/permissionMiddleware");
const { include } = require("underscore");
const { getRolePermissions } = require("./permissionController.js");
const emailQueue = require("../queue/emailQueue.js");
const messageQueue = require("../queue/messageQueue.js");

// POST /login
async function loginUser(req, res) {
  try {
    // Reload user with Role association
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Role }],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get all permissions for this user (role-based + direct)
    const permissions = await getUserPermissions(user.id);

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.Role ? user.Role.name : null,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2days" }
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
        role: user.Role, // Returns full role object
        permissions: permissions,
        profileImage: user.profileImage,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message }, "loginError>>>>>>");
  }
}
// POST /users with hashed password....!
async function postUser(req, res) {
  try {
    const { name, email, password, role } = req.body;

    let roleData = null; // Object to store { id, name }
    let selectedRoleId = null;

    if (role) {
      const roleRecord = await Role.findOne({ where: { id: role } });
      if (!roleRecord) {
        return res.status(400).json({ error: `Role '${role}' not found` });
      }
      // Store just the needed fields
      roleData = { id: roleRecord.id, name: roleRecord.name };
      selectedRoleId = roleRecord.id;
    } else {
      // If no role provided, look for a default 'User' role
      const defaultRole = await Role.findOne({ where: { name: "User" } });
      if (defaultRole) {
        roleData = { id: defaultRole.id, name: defaultRole.name };
        selectedRoleId = defaultRole.id;
        console.log("SignUP is running");
      } else {
        return res
          .status(400)
          .json({ error: "No role provided and no default User role found" });
      }
    }

    // 🔐 HASH PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Save user with hashed password
    const user = await User.create({
      name,
      email,
      hashPassword: hashedPassword,
      roleId: selectedRoleId,
    });

    const rolePermissions = await getRolePermissions(selectedRoleId);
    const userPermissions = await saveUserPermissions(user.id, rolePermissions);

    console.log("Signup Successful. Storing in DB:", {
      id: user.id,
      name: user.name,
      email: user.email,
      roleId: user.roleId,
    });

    await emailQueue.add({
      event: "sendEmail",
      email,
      message: "Welcome to our app",
    });

    await messageQueue.add({
      event: "sendSlackMessage",
      entity: "User",
      payload: user.toJSON(),
    });

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
        permissions: userPermissions,
      },
    });
  } catch (err) {
    console.log({ error: err.message }, "posterror>>>>>>>>>>>>");
    return res.status(500).json({ error: err.message });
  }
}

async function forgotPassword(req, res) {
  try {
    const user = req.body; // coming from middleware
    const expiryTime = Date.now() + 15 * 60 * 1000; // 15 min
    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    // Save token and expiry
    await User.update(
      {
        resetToken: token,
        resetTokenExpiry: new Date(expiryTime),
      },
      { where: { email: user.email } }
    );
    // Create reset link for frontend
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    // Send email
    await sendEmail(
      user.email,
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

async function resetPassword(req, res) {
  try {
    const user = req.user; // coming from middleware
    const newPassword = req.newPassword;
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    // Update password + clear token fields
    await User.update(
      {
        hashPassword: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
      { where: { id: user.id } }
    );
    return res.json({ message: "Password reset successful." });
  } catch (err) {
    res.status(500).json({ error: "Invalid or expired token." });
    console.log(err, "<reset error>");
  }
}

// GET /users
async function getUser(req, res) {
  try {
    const result = await paginate(User, req.query, ["name", "email"], {
      include: [{ model: Role }],
    });
    // search in name & email
    return res.json(result);
  } catch (err) {
    console.log({ error: err.message }, "Error in getUser >>>>");
    return res.status(500).json({ error: err.message });
  }
}
// GET /users/:id
async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const allPermissions = await Permission.findAll();
    const user = await User.findByPk(id, {
      include: [
        {
          model: Role,
        },
        {
          model: Permission,
          through: { attributes: [] },
        },
      ],
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    const userData = user.toJSON();

    // Combine Role Permissions and Direct User Permissions
    const rolePermissions = userData.Role?.Permissions || [];
    const directUserPermissions = userData.Permissions || [];

    // Merge and deduplicate by ID
    const combinedPermissions = [...rolePermissions, ...directUserPermissions];
    const uniquePermissions = Array.from(
      new Map(combinedPermissions.map((p) => [p.id, p])).values()
    );

    // Assign to userPermissions as requested
    userData.userPermissions = uniquePermissions;
    // Cleanup redundant fields
    delete userData.Permissions;
    if (userData.Role) delete userData.Role.Permissions;

    userData.profileImage = user.profileImage;
    userData.allPermissions = allPermissions;

    console.log("getUserById Response Data:", {
      id: userData.id,
      name: userData.name,
      profileImage: userData.profileImage,
    });

    return res.json(userData);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
// PUT /users
async function updateUser(req, res) {
  try {
    const { id } = req.params; // get id from URL
    const { email, password, role } = req.body; // updated data
    const user = req.user; // coming from middleware

    // Only update provided fields
    if (email) user.email = email;

    // 🔐 HASH PASSWORD
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.hashPassword = await bcrypt.hash(password, salt);
    }

    if (role.id) {
      const oldRoleId = user.roleId;
      user.roleId = role.id;

      // If the role has changed, update permissions to match the new role
      if (oldRoleId != role.id) {
        const rolePermissions = await getRolePermissions(role.id);
        // setPermissions will remove old direct permissions and set the new ones
        await user.setPermissions(rolePermissions);
      }
    }

    await user.save();
    return res.json({ message: "User updated successfully" });
  } catch (err) {
    console.log({ error: err.message }, "<<<<<<updateError>>>>>>");
    return res.status(500).json({ error: err.message });
  }
}
// DELETE /users/:id
async function deleteUser(req, res) {
  try {
    const user = req.user; // coming from middleware
    if (!user) return res.status(404).json({ error: "User not found" });
    await user.destroy();
    return res.json({ message: "User deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function logoutUser(req, res) {
  try {
    const user = req.user; // coming from middleware
    user.authToken = "";
    await user.save();
    return res.json({ message: "Logout successful" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
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
