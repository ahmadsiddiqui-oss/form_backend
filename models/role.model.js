module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define("Role", {
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

  Role.associate = (models) => {
    Role.hasMany(models.User, { foreignKey: "roleId" });
    Role.belongsToMany(models.Permission, {
      through: "RolePermissions",
      foreignKey: "roleId",
    });
  };

  return Role;
};
