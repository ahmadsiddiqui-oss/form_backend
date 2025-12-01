const express = require("express");
const router = express.Router();
const validateAuthor = require("../middlewares/authorMiddleware");
const authorController = require("../controller/authorController.js");

// Routes
router.post("/", validateAuthor, authorController.postAuthor);
router.get("/", authorController.getAuthor);
router.get("/:id", authorController.getAuthorById);
router.put("/:id", authorController.updateAuthor);
router.delete("/:id", authorController.deleteAuthor);

module.exports = router;
