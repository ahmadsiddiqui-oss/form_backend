const express = require("express");
const router = express.Router();
const roleController = require("../controller/roleController");

router.get("/", roleController.getRole);
router.post("/assign-per", roleController.assignPermissions);

module.exports = router;
