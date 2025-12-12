const express = require("express");
const router = express.Router();
const bookController = require("../controller/bookController.js");
const validateBook = require("../middlewares/bookMiddleware.js");
const { auth } = require("../middlewares/userMiddleware.js");

// Routes
router.post("/", auth, validateBook, bookController.postBook);
router.get("/", auth, bookController.getBook);
router.get("/:id", auth, bookController.getBookById);
router.put("/:id", auth, bookController.updateBook);
router.delete("/:id", auth, bookController.deleteBook);

module.exports = router;
