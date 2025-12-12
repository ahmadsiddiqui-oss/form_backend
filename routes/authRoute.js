const express = require("express");
const router = express.Router();
const userController = require("../controller/userController.js");
const { auth, validateLogin, validateLogout, validateForgotPassword, validateSignup, validateResetPassword } = require("../middlewares/userMiddleware");

// Auth Routes

router.post("/login", validateLogin, userController.loginUser);
router.post("/signup", validateSignup, userController.postUser);
router.post("/forgot-password", validateForgotPassword, userController.forgotPassword);
router.post("/reset-password/:token", validateResetPassword, userController.resetPassword);
router.post("/logout", auth, validateLogout, userController.logoutUser);

module.exports = router;
