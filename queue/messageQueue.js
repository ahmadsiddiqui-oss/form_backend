require("dotenv").config();
const axios = require("axios");
const Queue = require("bull");
const { redis } = require("../utils/redis");

const messageQueue = new Queue("message", {
  redis: {
    host: "127.0.0.1",
    port: 6379,
    maxRetriesPerRequest: 3,
    maxLoadingRetryTime: 30000,
  },
});
const worker = {
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

messageQueue.process(async (job) => {
  console.log("Processing job:", job.id);
  await worker[job.data.event](job.data);
  // Pass result to completed event
});
// Listener for completed jobs
messageQueue
  .on("completed", (job, result) => {
    console.log(
      `Job ${job.id} completed with result:`,
      JSON.stringify(job.data)
    );
  })
  .on("failed", (job, err) => {
    console.error(`Job ${job.id} failed:`, err.message);
  });

console.log("Message worker initialized and listening for real tasks...");

module.exports = messageQueue;
