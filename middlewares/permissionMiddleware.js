const { Role, Permission } = require("../models");
const { User } = require("../models");

/**
 * Middleware to check if a user has a specific permission
 * Usage: checkPermission('create_user')
 */
function checkPermission(requiredPermission) {
  return async (req, res, next) => {
    try {
      const user = req.loginUser;

      if (!user) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      // Get user's role with its permissions
      const role = await Role.findByPk(user.roleId, {
        include: [
          {
            model: Permission,
            through: { attributes: [] }, // Exclude junction table attributes
          },
        ],
      });

      if (!role) {
        return res.status(403).json({ error: "User has no role assigned" });
      }

      // Check if role has the required permission
      const hasPermission = role.Permissions.some(
        (perm) => perm.name === requiredPermission
      );

      // Also check user's direct permissions (if any)
      const userDirectPermissions = await user.getPermissions();
      const hasDirectPermission = userDirectPermissions.some(
        (perm) => perm.name === requiredPermission
      );

      if (!hasPermission && !hasDirectPermission) {
        return res.status(403).json({
          error: `Access denied. Required permission: ${requiredPermission}`,
        });
      }

      // User has permission, continue
      next();
    } catch (err) {
      console.error("Permission check error:", err);
      return res.status(500).json({ error: "Error checking permissions" });
    }
  };
}

/**
 * Get all permissions for a user (role-based + direct)
 */
async function getUserPermissions(userId) {
  try {
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Role,
          include: [Permission],
        },
        {
          model: Permission,
          through: { attributes: [] },
        },
      ],
    });

    if (!user) {
      return [];
    }

    // Combine role permissions and direct permissions
    const rolePermissions = user.Role?.Permissions || [];
    const directPermissions = user.Permissions || [];

    // Merge and deduplicate
    const allPermissions = [...rolePermissions, ...directPermissions];
    const uniquePermissions = Array.from(
      new Map(allPermissions.map((p) => [p.id, p])).values()
    );

    return uniquePermissions.map((p) => p.name);
  } catch (err) {
    console.error("Error getting user permissions:", err);
    return [];
  }
}

/**
 * Check if user has any of the required permissions
 */
function checkAnyPermission(...requiredPermissions) {
  return async (req, res, next) => {
    try {
      const user = req.loginUser;

      if (!user) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const userPermissions = await getUserPermissions(user.id);

      const hasAnyPermission = requiredPermissions.some((perm) =>
        userPermissions.includes(perm)
      );

      if (!hasAnyPermission) {
        return res.status(403).json({
          error: `Access denied. Required one of: ${requiredPermissions.join(
            ", "
          )}`,
        });
      }

      next();
    } catch (err) {
      console.error("Permission check error:", err);
      return res.status(500).json({ error: "Error checking permissions" });
    }
  };
}

/**
 * Check if user has all required permissions
 */
function checkAllPermissions(...requiredPermissions) {
  return async (req, res, next) => {
    try {
      const user = req.loginUser;

      if (!user) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const userPermissions = await getUserPermissions(user.id);

      const hasAllPermissions = requiredPermissions.every((perm) =>
        userPermissions.includes(perm)
      );

      if (!hasAllPermissions) {
        return res.status(403).json({
          error: `Access deniedssss. Required all of: ${requiredPermissions.join(
            ", "
          )}`,
        });
      }

      next();
    } catch (err) {
      console.error("Permission check error:", err);
      return res.status(500).json({ error: "Error checking permissions" });
    }
  };
}

module.exports = {
  checkPermission,
  checkAnyPermission,
  checkAllPermissions,
  getUserPermissions,
};
