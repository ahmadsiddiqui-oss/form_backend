require("dotenv").config();
// const emailQueue = require("./emailQueue");
const Queue = require("bull");
const { redis } = require("./redis");
const sendEmail = require("./email"); // Import real email utility

const emailQueue = new Queue("onboarding", {
  redis: {
    host: "127.0.0.1",
    port: 6379,
    maxRetriesPerRequest: 3,
    maxLoadingRetryTime: 30000,
  },
});
const worker = {
  sendEmail: async (data) =>
    await sendEmail(
      data.email,
      "Welcome to Our App",
      `<h1>Hello</h1><p>${data.message}</p>`
    ),
};

emailQueue.process(async (job) => {
  console.log("Processing job:", job);
  await worker[job.data.event](job.data);
});
// Listener for completed jobs
emailQueue
  .on("completed", (job, result) => {
    console.log(`Job ${job.id} completed with result:`, JSON.stringify(job.result));
  })
  .on("failed", (job, err) => {
    console.error(`Job ${job.id} failed:`, err.message);
  });

console.log("Email worker initialized and listening for real tasks...");

module.exports = emailQueue;
