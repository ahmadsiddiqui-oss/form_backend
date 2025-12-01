const express = require("express");
require("dotenv").config();
// const helmet = require('helmet'); // optional
// const morgan = require('morgan'); // optional

const authorsRouter = require("./routes/authorRoute");
const booksRouter = require("./routes/bookRoute");
const { errorHandler } = require("./middlewares/errorHandler");

const cors = require("cors");

const app = express(); // <<< MUST be declared first

// CORS
app.use(cors({
  origin: "http://localhost:3000",
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// optional middlewares
// app.use(helmet());
// app.use(morgan('dev'));

// Routes
app.use("/api/authorRoutes", authorsRouter);
app.use("/api/bookRoutes", booksRouter);

// fallback 404
app.use((req, res, next) => res.status(404).json({ error: "Not Found" }));

// centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
