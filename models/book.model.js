"use strict";

module.exports = (sequelize, DataTypes) => {
  const Book = sequelize.define(
    "Book",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isbn: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      publishedDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      authorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "authors", key: "id" },
      },
    },
    {
      tableName: "books",
    }
  );

  Book.associate = (models) => {
    Book.belongsTo(models.Author, { foreignKey: "authorId", as: "author" });
  };

  return Book;
};
