const Joi = require("joi");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

// Joi Schema
const userSchema = Joi.object({
  name: Joi.string().min(3).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 3 characters",
  }),

  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Invalid email format",
  }),

  password: Joi.string().min(2).max(10).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 2 characters",
  }),
});

const validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const messages = error.details.map((err) => err.message);
    return res.status(400).json({ errors: messages });
  }

  next();
};

const auth = async (req, res, next) => {
  try {
    const tokenHeader = req.headers["authorization"];
    // console.log(req.headers, "<<header>>");
    if (typeof tokenHeader != "undefined") {
      const token = tokenHeader.split(" ")[1];
      // console.log(token, "<<token>>");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // console.log(decoded, "<<decoded user>>");

      // 2️⃣ Check in database (match email + token)
      const user = await User.findOne({
        where: {
          email: decoded.email,
          authToken: token, // token must match DB
        },
      });

      if (!user) {
        return res
          .status(401)
          .json({ error: "Invalid token OR user logged out" });
      }
      req.token = user;
      req.params.id = user.id;
      next();
    } else {
      res.status(401).json({ error: "No token provided" });
    }
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
};

module.exports = { validateUser, auth };
