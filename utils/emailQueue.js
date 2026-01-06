require("dotenv").config();
const axios = require("axios");
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
  sendEmail: async (data) => {
    await sendEmail(
      data.email,
      "Welcome to Our App",
      `<h1>Hello</h1><p>${data.message}</p>`
    );
    return { status: "Email sent", to: data.email };
  },
  sendSlackMessage: async (data) => {
    const { entity, payload } = data;

    const message = `
*New ${entity} Created*
• ID: ${payload.id}
• Name: ${payload.name || payload.title}
• Created At: ${payload.createdAt}
`;

    await axios.post(
      "https://slack.com/api/chat.postMessage",
      {
        channel: process.env.INVOHUB_CHANNEL_ID,
        text: message,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    return { status: "Slack message sent", entity };
  },
};

emailQueue.process(async (job) => {
  console.log("Processing job:", job.id);
  await worker[job.data.event](job.data);
  // Pass result to completed event
});
// Listener for completed jobs
emailQueue
  .on("completed", (job, result) => {
    console.log(
      `Job ${job.id} completed with result:`,
      JSON.stringify(job.data)
    );
  })
  .on("failed", (job, err) => {
    console.error(`Job ${job.id} failed:`, err.message);
  });

console.log("Email worker initialized and listening for real tasks...");

module.exports = emailQueue;
