const db = require("../models/index.js");
const { Author } = db;

// POST /authors
async function postAuthor(req, res) {
  try {
    const { name, email } = req.body;
    console.log("Received data:", { name, email });
    if (!name) return res.status(400).json({ error: "Name is required" });
    const existsEmail = await Author.findOne({ where: { email } });
    if (existsEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }
    const author = await Author.create({ name, email });
    console.log("Author created:", author);
    return res.status(201).json(author);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// GET /authors
async function getAuthor(req, res) {
  try {
    const authors = await Author.findAll();
    // console.log(authors);
    return res.json(authors);
  } catch (err) {
    console.log({ error: err.message }, "eerrrrrrrororor>>>>>>");
    return res.status(500).json({ error: err.message });
  }
}

// GET /authors/:id
async function getAuthorById(req, res) {
  try {
    const { id } = req.params;
    const author = await Author.findByPk(id);
    if (!author) return res.status(404).json({ error: "Author not found" });
    return res.json(author);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// PUT /authors
async function updateAuthor(req, res) {
  try {
    const { id } = req.params; // get id from URL
    const { name, email } = req.body; // updated data
    if (!id)
      return res.status(400).json({ error: "id is required for update" });
    const author = await Author.findByPk(id);
    console.log(id);
    if (!author) return res.status(404).json({ error: "Author not found" });
    await author.update({ id, name, email });
    return res.json(author);
  } catch (err) {
    console.log({ error: err.message }, "updateEerrrrrrrororor>>>>>>");
    return res.status(500).json({ error: err.message });
  }
}

// DELETE /authors/:id
async function deleteAuthor(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    const deleted = await Author.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: "Author not found" });
    return res.json({ message: "Author deleted" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  postAuthor,
  getAuthor,
  getAuthorById,
  updateAuthor,
  deleteAuthor,
};
