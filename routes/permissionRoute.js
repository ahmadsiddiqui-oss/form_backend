const express = require("express");
const router = express.Router();
const permissionController = require("../controller/permissionController");

router.get("/permissions", permissionController.getPermission);
router.post("/assign-permissions", permissionController.assignPermissions);

module.exports = router;
