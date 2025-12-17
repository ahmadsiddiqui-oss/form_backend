const express = require("express");
require("dotenv").config();
const userRouter = require("./routes/userRoute");
const authRouter = require("./routes/authRoute");
const authorsRouter = require("./routes/authorRoute");
const booksRouter = require("./routes/bookRoute");
const fileRouter = require("./routes/fileRoute");
const { errorHandler } = require("./middlewares/errorHandler");
const cors = require("cors");
const app = express(); // <<< MUST be declared first

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// optional middlewares
// app.use(helmet());
// app.use(morgan('dev'));
// static files
app.use("/api/uploads", express.static("uploads"));
// health api
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running" });
});

// Routes
app.use("/api/authorRoutes", authorsRouter);
app.use("/api/bookRoutes", booksRouter);
app.use("/api/userRoutes", userRouter);
app.use("/api/authRoutes", authRouter);
app.use("/api/fileRoutes", fileRouter);

// fallback 404
app.use((req, res, next) => res.status(404).json({ error: "Not Founds!" }));

// centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
