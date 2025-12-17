const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");
const { auth } = require("../middlewares/userMiddleware");
const { addProfileImage } = require("../controller/fileController");

// POST route for file upload
router.post("/upload", auth, upload.single("myFile"), addProfileImage);

module.exports = router;
