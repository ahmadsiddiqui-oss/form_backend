module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define("Permission", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
  });

  Permission.associate = (models) => {
    Permission.belongsToMany(models.Role, {
      through: "RolePermissions",
      foreignKey: "permissionId",
    });
    Permission.belongsToMany(models.User, {
      through: "UserPermissions",
      foreignKey: "permissionId",
    });
  };

  return Permission;
};
