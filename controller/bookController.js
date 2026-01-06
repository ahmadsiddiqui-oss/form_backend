const db = require("../models/index.js");
const paginate = require("../utils/paginate.js");
const { Book } = db;
const emailQueue = require("../utils/emailQueue.js");

async function postBook(req, res) {
  try {
    const payload = req.body;
    const { isbn } = payload;
    const existsIsbn = await Book.findOne({ where: { isbn } });
    if (existsIsbn) {
      return res.status(400).json({ error: "ISBN already exists" });
    }
    const book = await Book.create(payload);
    await emailQueue.add({
      event: "sendSlackMessage",
      entity: "Book",
      payload: book.toJSON(),
    });
    return res.status(201).json(book);
  } catch (err) {
    return res.status(500).json({ error: err.message }, "err");
  }
}

async function getBook(req, res) {
  try {
    const books = await paginate(
      Book,
      req.query,
      ["title"] // searchable fields
    );

    return res.json(books);
  } catch (err) {
    console.log(err.message, "getBook error");
    return res.status(500).json({ error: err.message });
  }
}

async function getBookById(req, res) {
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
