// middlewares/validateBook.js
const Joi = require("joi");

// Define the schema
const bookSchema = Joi.object({
  title: Joi.string().min(4).max(20).required().messages({
    "string.empty": "Title is required",
    "string.min": "Title must be at least 4 characters",
    "string.max": "Title cannot exceed 20 characters",
  }),

  isbn: Joi.string().required().messages({
    "string.empty": "ISBN is required",
  }),

  publishedDate: Joi.date().messages({
    "date.base": "Published date must be a valid date",
  }),

  authorId: Joi.number().integer().positive().required().messages({
    "number.base": "Author ID must be a number",
    "number.integer": "Author ID must be an integer",
    "number.positive": "Author ID must be a positive number",
    "any.required": "Author ID is required",
  }),
});

const validateBook = (req, res, next) => {
  const { error } = bookSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      success: false,
      errors: error.details.map((err) => err.message),
    });
  }

  next();
};

module.exports = validateBook;
