// middlewares/validateAuthor.js
const yup = require("yup");

// Define schema
const authorSchema = yup.object().shape({
  name: yup.string().min(3).required("Name is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
});

// Middleware
const validateAuthor = async (req, res, next) => {
  try {
    await authorSchema.validate(req.body, { abortEarly: false });
    next(); // Validation passed
  } catch (err) {
    // Return all validation errors
    return res.status(400).json({ errors: err.errors });
  }
};

module.exports = validateAuthor;
