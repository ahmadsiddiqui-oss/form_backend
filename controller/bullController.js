// const emailQueue = require("../utils/emailQueue");

// const registerUser = async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({ error: "Email is required" });
//     }

//     await emailQueue.add(
//       "sendEmail",
//       {
//         email,
//         message: "Welcome to our app",
//       },
//       {
//         attempts: 3, // Retry 3 times if it fails
//         backoff: 5000, // Wait 5 seconds between retries
//       }
//     );

//     console.log(`Email job added to queue for: ${email}`);
//     return res.json({
//       message: "User registered, email will be sent shortly",
//     });
//   } catch (err) {
//     console.error("Queue Error:", err);
//     return res.status(500).json({ error: "Failed to queue email" });
//   }
// };

// module.exports = { registerUser };
