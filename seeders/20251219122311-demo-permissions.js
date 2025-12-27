"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Permissions",
      [
        // User Management Permissions
        {
          name: "create_user",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "read_user",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "update_user",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "delete_user",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // Book Management Permissions
        {
          name: "create_book",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "read_book",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "update_book",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "delete_book",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // Author Management Permissions
        {
          name: "create_author",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "read_author",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "update_author",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "delete_author",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // Role & Permission Management
        {
          name: "manage_roles",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "manage_permissions",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // Reports & Analytics
        {
          name: "view_reports",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "export_data",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // HR Specific
        {
          name: "manage_employees",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "view_payroll",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // Finance Specific
        {
          name: "manage_finances",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "approve_expenses",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Permissions", null, {});
  },
};
