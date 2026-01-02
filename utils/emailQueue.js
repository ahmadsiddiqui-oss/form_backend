const Queue = require("bull");

const onboardingQueue = new Queue("onboarding", {
  redis: {
    host: "127.0.0.1",
    port: 6379,
  },
});

console.log("Email queue initialized");

module.exports = { onboardingQueue };
