const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

async function sendEmail(to, subject, html) {
  return await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USERNAME, // sender address
    to,
    subject,
    html,
  });
}
module.exports = sendEmail;
