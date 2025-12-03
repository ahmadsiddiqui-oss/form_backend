// middlewares/validateAuthor.js
const yup = require("yup");

// Define schema
const userSchema = yup.object().shape({
  name: yup.string().min(3).required("Name is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  password: yup.number().min(2).max(10).required("Password is required"),
});

// Middleware
const validateUser = async (req, res, next) => {
  try {
    await userSchema.validate(req.body, { abortEarly: false });
    next(); // Validation passed
  } catch (err) {
    // Return all validation errors
    return res.status(400).json({ errors: err.errors });
  }
};

module.exports = validateUser;
