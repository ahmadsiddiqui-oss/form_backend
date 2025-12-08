const express = require("express");
const router = express.Router();
const bookController = require("../controller/bookController.js");
const validateBook = require("../middlewares/bookMiddleware.js");

// Routes
router.post("/", validateBook, bookController.postBook);
router.get("/", bookController.getBook);
router.get("/:id", bookController.getBookById);
router.put("/:id", bookController.updateBook);
router.delete("/:id", bookController.deleteBook);

module.exports = router;
