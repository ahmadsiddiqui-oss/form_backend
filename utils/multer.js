// utils/multerConfig.js
const multer = require("multer");
const path = require("path");

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // folder where files will be stored
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// File filter to allow only certain file types
const fileFilter = (allowedTypes) => (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;
  const isAllowed = allowedTypes.some(
    (type) => type === ext || type === mimetype
  );

  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed"), false);
  }
};

// Multer instance - directly export configured multer
const upload = multer({
  storage,
  fileFilter: fileFilter([
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    "image/jpeg",
    "image/png",
    "image/gif",
  ]),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

module.exports = upload;
