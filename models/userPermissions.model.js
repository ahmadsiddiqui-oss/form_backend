module.exports = (sequelize, DataTypes) => {
  const UserPermissions = sequelize.define("UserPermissions", {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    permissionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Permissions",
        key: "id",
      },
    },
  });

  return UserPermissions;
};
