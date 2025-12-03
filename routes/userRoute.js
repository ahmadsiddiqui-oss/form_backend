const express = require("express");
const router = express.Router();
const userController = require("../controller/userController.js");
const validateUser = require("../middlewares/userMiddleware.js");

// Routes
router.post("/login", userController.loginUser);
router.post("/signup", userController.postUser);
router.get("/", userController.getUser);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
