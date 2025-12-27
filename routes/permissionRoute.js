const express = require("express");
const router = express.Router();
const permissionController = require("../controller/permissionController");
const { auth } = require("../middlewares/userMiddleware");
const { checkPermission } = require("../middlewares/permissionMiddleware");

router.get(
  "/permissions",
  auth,
  checkPermission("manage_permissions"),
  permissionController.getPermission
);
router.post(
  "/assign-permissions",
  auth,
  checkPermission("manage_permissions"),
  permissionController.assignPermissions
);

module.exports = router;
