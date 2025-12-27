module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("RolePermissions", {
      roleId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Roles",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      permissionId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Permissions",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("RolePermissions");
  },
};
