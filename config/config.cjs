require("dotenv").config();
module.exports = {
  development: {
    username: process.env.DB_USER || process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "1234",
    database: process.env.DB_NAME || "form_database",
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    dialect: process.env.DB_DIALECT || "postgres",
  },
  test: {
    username: process.env.DB_USER || process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "1234",
    database: process.env.DB_NAME || "form_database_test",
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    dialect: process.env.DB_DIALECT || "postgres",
  },
  production: {
    username: process.env.DB_USER || process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    dialect: process.env.DB_DIALECT || "postgres",
  },
};
