const cron = require("node-cron");
const { User } = require("../models/index");
const { Op } = require("sequelize");
const { sendEmailToUser } = require("../controller/emailController");

// Setup a cron job to clean up expired reset tokens every hour

cron.schedule("0 */2 * * *", async () => {
  console.log("Running scheduled task: Cleaning up expired reset tokens...");
  try {
    const [updatedCount] = await User.update(
      {
        resetToken: null,
        resetTokenExpiry: null,
      },
      {
        where: {
          resetTokenExpiry: {
            [Op.lt]: new Date(),
          },
        },
      }
    );
    console.log(
      `Scheduled task completed: ${updatedCount} expired tokens cleaned up.`
    );
  } catch (error) {
    console.error("Error during scheduled task (token cleanup):", error);
  }
});

// New Cron Job: Send Author & Book report every minute
cron.schedule("0 */2 * * *", async () => {
  console.log("Running scheduled task: Sending Author & Book report...");
  await sendEmailToUser();
});

// A simple heartbeat task that runs every 30 minutes to ensure the cron system is active
cron.schedule("0 */2 * * *", () => {
  console.log(`Cron Heartbeat: System active at ${new Date().toISOString()}`);
});

console.log("Cron jobs have been initialized successfully.");
