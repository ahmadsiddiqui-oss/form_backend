const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

async function sendEmail(to, subject, html) {
  return await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USERNAME,
    to,
    subject,
    html,
  });
}
console.log("Email sent successfully");

module.exports = sendEmail;
