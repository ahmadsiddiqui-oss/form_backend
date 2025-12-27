"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, get all roles and permissions to map IDs
    const roles = await queryInterface.sequelize.query(
      `SELECT id, name FROM "Roles";`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const permissions = await queryInterface.sequelize.query(
      `SELECT id, name FROM "Permissions";`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Create lookup objects
    const roleMap = {};
    roles.forEach((role) => {
      roleMap[role.name] = role.id;
    });

    const permMap = {};
    permissions.forEach((perm) => {
      permMap[perm.name] = perm.id;
    });

    // Define role-permission mappings
    const rolePermissions = [];

    // 1. ADMIN - Gets ALL permissions
    if (roleMap["Admin"]) {
      permissions.forEach((perm) => {
        rolePermissions.push({
          roleId: roleMap["Admin"],
          permissionId: perm.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });
    }

    // 2. MANAGER - Gets most permissions except role/permission management
    if (roleMap["Manager"]) {
      const managerPerms = [
        "create_user",
        "read_user",
        "update_user",
        "delete_user",
        "create_book",
        "read_book",
        "update_book",
        "delete_book",
        "create_author",
        "read_author",
        "update_author",
        "delete_author",
        "view_reports",
        "export_data",
      ];
      managerPerms.forEach((permName) => {
        if (permMap[permName]) {
          rolePermissions.push({
            roleId: roleMap["Manager"],
            permissionId: permMap[permName],
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      });
    }

    // 3. USER - Gets read-only permissions
    if (roleMap["User"]) {
      const userPerms = ["read_user", "read_book", "read_author"];
      userPerms.forEach((permName) => {
        if (permMap[permName]) {
          rolePermissions.push({
            roleId: roleMap["User"],
            permissionId: permMap[permName],
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      });
    }

    // 4. HR - Gets user management + HR-specific permissions
    if (roleMap["HR"]) {
      const hrPerms = [
        "create_user",
        "read_user",
        "update_user",
        "delete_user",
        "manage_employees",
        "view_payroll",
        "view_reports",
        "export_data",
      ];
      hrPerms.forEach((permName) => {
        if (permMap[permName]) {
          rolePermissions.push({
            roleId: roleMap["HR"],
            permissionId: permMap[permName],
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      });
    }

    // 5. FINANCE - Gets finance-specific + some read permissions
    if (roleMap["Finance"]) {
      const financePerms = [
        "read_user",
        "read_book",
        "read_author",
        "manage_finances",
        "approve_expenses",
        "view_reports",
        "export_data",
      ];
      financePerms.forEach((permName) => {
        if (permMap[permName]) {
          rolePermissions.push({
            roleId: roleMap["Finance"],
            permissionId: permMap[permName],
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      });
    }

    // Insert all role-permissions
    if (rolePermissions.length > 0) {
      await queryInterface.bulkInsert("RolePermissions", rolePermissions, {});
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("RolePermissions", null, {});
  },
};
