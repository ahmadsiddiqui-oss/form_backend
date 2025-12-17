const express = require("express");
const router = express.Router();
const validateAuthor = require("../middlewares/authorMiddleware");
const authorController = require("../controller/authorController.js");
const { auth, authorizeRoles } = require("../middlewares/userMiddleware.js");

// Routes
router.post("/", auth, validateAuthor, authorController.postAuthor);
router.get("/", auth, authorController.getAuthor);
router.get("/:id", auth, authorController.getAuthorById);
router.put("/:id", auth, validateAuthor, authorController.updateAuthor);
router.delete("/:id", auth, validateAuthor, authorController.deleteAuthor);

module.exports = router;
