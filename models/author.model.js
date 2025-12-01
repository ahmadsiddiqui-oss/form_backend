const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Author = sequelize.define(
    "author",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
    },
    {
      tableName: "authors",
    }
  );

  Author.associate = (models) => {
    Author.hasMany(models.Book, { foreignKey: "authorId", as: "books" });
  };

  return Author;
};
