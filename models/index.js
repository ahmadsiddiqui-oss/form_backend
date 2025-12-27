const dotenv = require("dotenv");
dotenv.config();

const { Sequelize, DataTypes } = require("sequelize");
const defineAuthor = require("./author.model.js");
const defineBook = require("./book.model.js");
const defineUser = require("./user.model.js");
const defineRole = require("./role.model.js");
const definePermission = require("./permission.model.js");

// DB config
const DB_NAME = process.env.DB_NAME || "form_database";
const DB_USER = process.env.DB_USER || process.env.DB_USERNAME || "postgres";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_HOST = process.env.DB_HOST || "127.0.0.1";
const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432;
const DB_DIALECT = process.env.DB_DIALECT || "postgres";

// initialize Sequelize
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: DB_DIALECT,
  logging: false,
});

// define models
const Author = defineAuthor(sequelize, DataTypes);
const Book = defineBook(sequelize, DataTypes);
const User = defineUser(sequelize, DataTypes);
const Role = defineRole(sequelize, DataTypes);
const Permission = definePermission(sequelize, DataTypes);
const RolePermissions = definePermission(sequelize, DataTypes); 
// Create models object for associations
const models = { Author, Book, User, Role, Permission };

// Call associate methods for all models
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// export
module.exports = {
  sequelize,
  Author,
  Book,
  User,
  Role,
  Permission,
  RolePermissions,
};
// module.export db;
