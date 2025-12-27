const express = require("express");
const router = express.Router();
const userController = require("../controller/userController.js");
const {  auth,  validateDeleteUser,  validateUpdateUser,  authorizeRoles,} = require("../middlewares/userMiddleware.js");

router.get("/",auth,authorizeRoles("admin", "manager"),userController.getUser);
router.get("/:id", auth, userController.getUserById);
router.put("/:id", auth, validateUpdateUser, userController.updateUser);
router.delete("/:id", validateDeleteUser, userController.deleteUser);

module.exports = router;
