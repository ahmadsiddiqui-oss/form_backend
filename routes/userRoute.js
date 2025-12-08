const express = require("express");
const router = express.Router();
const userController = require("../controller/userController.js");
const { validateUser, auth } = require("../middlewares/userMiddleware.js");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// Routes
router.post("/login", userController.loginUser);
router.post("/signup", validateUser, userController.postUser);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password/:token", userController.resetPassword);
router.get("/", userController.getUser);                      
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.post("/logout", auth, userController.logoutUser);

module.exports = router;
