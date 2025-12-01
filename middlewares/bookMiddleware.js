// middlewares/validateBook.js
const yup = require("yup");

// Define the schema
const bookSchema = yup.object().shape({
  title: yup.string().min(4).max(20).required("Title is required"),
  isbn: yup.string().required("ISBN is required"),
  publishedDate: yup
    .date()
    .nullable()
    .typeError("Published date must be a valid date"),
  authorId: yup
    .number()
    .required("Author ID is required")
    .integer("Author ID must be an integer")
    .positive("Author ID must be a positive number"),
});

// Middleware
const validateBook = async (req, res, next) => {
  try {
    await bookSchema.validate(req.body, { abortEarly: false });
    next(); // Validation passed
  } catch (err) {
    return res.status(400).json({
      success: false,
      errors: err.errors,
    });
  }
};

module.exports = validateBook;
