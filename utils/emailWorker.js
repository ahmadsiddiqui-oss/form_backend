require("dotenv").config();
// const emailQueue = require("./emailQueue");
const Queue = require("bull");
const { redis } = require("./redis");
const sendEmail = require("./email"); // Import real email utility

const emailQueue = new Queue("onboarding", {
  redis: {
    host: "127.0.0.1",
    port: 6379,
  },
});

emailQueue.process("sendEmail", async (job) => {
  const { email, message } = job.data;

  console.log(`[Worker] Processing email for: ${email}`);

  try {
    // Send the actual email
    await sendEmail(
      email,
      "Welcome to Our App",
      `<h1>Hello</h1><p>${message}</p>`
    );

    console.log(`[Worker] Successfully sent email to: ${email}`);
    return { status: "success" };
  } catch (error) {
    console.error(`[Worker] Failed to send email to ${email}:`, error.message);
    throw error; // Throwing error allows Bull to attempt a retry
  }
});

// Listener for completed jobs
emailQueue.on("completed", (job, result) => {
  console.log(`Job ${job.id} completed with result:`, JSON.stringify(result));
});

// Listener for failed jobs
emailQueue.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});

console.log("Email worker initialized and listening for real tasks...");

module.exports = emailQueue;
