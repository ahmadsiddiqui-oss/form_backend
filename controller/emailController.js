const db = require("../models");
const { Author, Book } = db;
const sendEmail = require("../utils/email");

// Method to send email with Authors and Books table
async function sendEmailToUser() {
  try {
    const authors = await Author.findAll();
    const books = await Book.findAll();
    const user = "ahmad.siddiqui+1@invozone.dev";

    if (!user) return;

    let authorsTable = `
      <h3>Authors</h3>
      <table border="1" cellpadding="5" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          ${authors
            .map(
              (a) => `
            <tr>
              <td>${a.id}</td>
              <td>${a.name}</td>
              <td>${a.email}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;

    let booksTable = `
      <h3>Books</h3>
      <table border="1" cellpadding="5" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th>ID</th>
            <th>Title</th>
            <th>ISBN</th>
            <th>Author ID</th>
          </tr>
        </thead>
        <tbody>
          ${books
            .map(
              (b) => `
            <tr>
              <td>${b.id}</td>
              <td>${b.title}</td>
              <td>${b.isbn}</td>
              <td>${b.authorId}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;

    const htmlContent = `
      <h2>Data Report</h2>
      ${authorsTable}
      <br/>
      ${booksTable}
    `;

    // Send to all users
    if (user) {
      await sendEmail(user, "Author & Book Report", htmlContent);
    }

    console.log("Scheduled report email sent to all users.");
  } catch (err) {
    console.error("Error in sendEmailToUser job:", err.message);
  }
}

module.exports = { sendEmailToUser };
