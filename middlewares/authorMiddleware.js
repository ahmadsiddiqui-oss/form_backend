// middlewares/validateAuthor.js
const Joi = require("joi");

// Define schema
const authorSchema = Joi.object({
  name: Joi.string().min(3).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 3 characters",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Invalid email format",
  }),
});

// Middleware
const validateAuthor = (req, res, next) => {
  const { error } = authorSchema.validate(req.body, { abortEarly: false });

  if (error) {
    // Map all errors to an array of messages
    const errors = error.details.map((err) => err.message);
    return res.status(400).json({ errors });
  }

  next();
};

module.exports = validateAuthor;
