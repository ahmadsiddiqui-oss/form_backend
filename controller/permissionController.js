const db = require("../models/index.js");
// const paginate = require("../utils/paginate");
const { Permission, Role, User } = db;

async function getPermission(req, res) {
  try {
    const permissions = await Permission.findAll();
    console.log(permissions);
    return res.json(permissions);
  } catch (err) {
    console.log({ error: err.message }, "getPermission error");
    return res.status(500).json({ error: err.message });
  } 
}

async function assignPermissions(req, res) {
  try {
    const { roleId, userId, permissions } = req.body;
    console.log("assignPermissions Body:", req.body);

    if (!permissions || !Array.isArray(permissions)) {
      return res
        .status(400)
        .json({ error: "Permissions must be an array of IDs" });
    }

    let targetInstance;

    // Case 1: Assign to Role
    if (roleId) {
      targetInstance = await Role.findByPk(roleId);
      if (!targetInstance) {
        return res.status(404).json({ error: "Role not found" });
      }
    }
    // Case 2: Assign to User directly
    else if (userId) {
      targetInstance = await User.findByPk(userId);
      if (!targetInstance) {
        return res.status(404).json({ error: "User not found" });
      }
    } else {
      return res
        .status(400)
        .json({ error: "Either roleId or userId is required" });
    }
    console.log("Target Instance:", targetInstance);

    // setPermissions works for both if associations are set up correctly (User.belongsToMany(Permission))
    await targetInstance.setPermissions(permissions);

    return res.json({
      message: "Permissions assigned successfully",
      target: userId
        ? `User: ${targetInstance.name || targetInstance.email}`
        : `Role: ${targetInstance.name}`,
    });
  } catch (err) {
    console.log({ error: err.message }, "assignPermissions error");
    return res.status(500).json({ error: err.message });
  }
}

async function getRolePermissions(roleId) {
  const role = await Role.findByPk(roleId, {
    include: [{ model: Permission, through: { attributes: [] } }],
  });
  return role ? role.Permissions.map((p) => p.id) : [];
}

// Helper to save permissions for a user
async function saveUserPermissions(userId, permissionIds) {
  const user = await User.findByPk(userId);
  if (user && permissionIds.length > 0) {
    await user.setPermissions(permissionIds);
  }
  return permissionIds;
}

module.exports = { getPermission, assignPermissions, getRolePermissions, saveUserPermissions };
