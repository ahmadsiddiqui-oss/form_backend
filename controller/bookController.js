const db = require("../models/index.js");
const paginate = require("../utils/paginate.js");
const { Book } = db;

async function postBook(req, res) {
  // if (!book) return modelMissing(res);
  try {
    const payload = req.body;
    const { title, isbn, publishedDate, authorId } = payload;
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    if (!isbn) {
      return res.status(400).json({ error: "ISBN is required" });
    }
    const existsIsbn = await Book.findOne({ where: { isbn } });
    if (existsIsbn) {
      return res.status(400).json({ error: "ISBN already exists" });
    }
    if (!authorId) {
      return res.status(400).json({ error: "Author ID is required" });
    }
    if (publishedDate && isNaN(Date.parse(publishedDate))) {
      return res.status(400).json({ error: "Published date is invalid" });
    }
    const created = await Book.create(payload);
    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ error: err.message }, "err");
  }
}

async function getBook(req, res) {
  try {
    const books = await paginate(
      Book,
      req.query,
      ["title", "isbn"] // searchable fields
    );

    return res.json(books);
  } catch (err) {
    console.log(err.message, "getBook error");
    return res.status(500).json({ error: err.message });
  }
}


async function getBookById(req, res) {
  // if (!book) return modelMissing(res);
  try {
    const { id } = req.params;
    const row = await Book.findByPk(id);
    if (!row) return res.status(404).json({ error: "book not found" });
    return res.json(row);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function updateBook(req, res) {
  // if (!book) return modelMissing(res);
  try {
    const { id } = req.params;
    const payload = req.body;
    const instance = await Book.findByPk(id);
    if (!instance) return res.status(404).json({ error: "book not found" });
    await instance.update(payload);
    return res.json(instance);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function deleteBook(req, res) {
  // if (!book) return modelMissing(res);
  try {
    const { id } = req.params;
    const deleted = await Book.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: "book not found" });
    return res.json({ message: "book deleted" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  postBook,
  getBook,
  getBookById,
  updateBook,
  deleteBook,
};
