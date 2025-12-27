const db = require("../models/index.js");
const { Role, Permission } = db;

async function getRole(req, res) {
  try {
    const roles = await Role.findAll({
      include: [{ model: Permission }],
    });
    console.log(roles);
    return res.json(roles);
  } catch (err) {
    console.log({ error: err.message }, "getRole error");
    return res.status(500).json({ error: err.message });
  }
}

async function assignPermissions(req, res) {
  try {
    const { roleIds, permissionIds } = req.body;
    console.log(roleIds, permissionIds, " role and permiission");
    // 1. Find the Role
    const role = await Role.findByPk(roleIds);
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    // 2. Find Permissions
    const permissions = await Permission.findAll({
      where: {
        id: permissionIds,
      },
    });

    if (permissions.length === 0) {
      return res.status(404).json({ error: "No valid permissions found" });
    }

    // 3. Assign Permissions to Role
    // This will add new permissions without removing existing ones.
    // Use .setPermissions() if you want to replace all permissions.
    await role.addPermissions(permissions);

    return res.json({
      message: "Permissions assigned successfully",
      role: role.name,
      assignedPermissions: permissions.map((p) => p.name),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { getRole, assignPermissions };
