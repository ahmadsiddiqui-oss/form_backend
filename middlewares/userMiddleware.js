const Joi = require("joi");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const bcrypt = require("bcryptjs");

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

async function validateLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({
        error: "Backend Error..! Email doesn't exists",
      });
    }
    const isPasswordValid = await bcrypt.compare(password, user.hashPassword);
    if (!isPasswordValid) {
      return res.status(400).json({
        error: "Incorrect password",
      });
    }
    // 4. Pass user to controller
    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function validateSignup(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    // 1. Check required fields
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }
    // 2. Check if email already exists
    const emailExists = await User.findOne({ where: { email } });
    if (emailExists) {
      return res.status(400).json({ error: "Email already exists" });
    }
    const allowedRoles = [role];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid roles...!" });
    }
    // Everything valid → continue
    next();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

const auth = async (req, res, next) => {
  try {
    const tokenHeader = req.headers["authorization"];
    // console.log(req.headers, "<<header>>");
    if (typeof tokenHeader != "undefined") {
      const token = tokenHeader.split(" ")[1];
      // console.log(token, "<<token>>");
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        if (
          err.name === "TokenExpiredError" &&
          (req.originalUrl.endsWith("/logout") || req.path.endsWith("/logout"))
        ) {
          decoded = jwt.verify(token, process.env.JWT_SECRET, {
            ignoreExpiration: true,
          });
        } else {
          throw err;
        }
      }
      // console.log(decoded, "<<decoded user>>");

      // 2️⃣ Check in database (match email + token)
      const user = await User.findOne({
        where: {
          email: decoded.email,
          authToken: token,
        },
        include: ["Role"], // This will fetch the Role model and populate user.Role
      });
      // console.log(user.id, "<<Authenticated user>>");
      if (!user) {
        return res
          .status(401)
          .json({ error: "Invalid token OR user logged out" });
      }
      req.token = user;
      req.loginUser = user;
      // req.params.id = user.id;
      // console.log(req.loginUser.id, "<<loginUser-id>>");
      next();
    } else {
      res.status(401).json({ error: "No token provided" });
    }
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
};

async function validateLogout(req, res, next) {
  try {
    const user = req.loginUser;
    console.log(user.id, "<<Users id>>");

    if (!user) {
      return res.status(401).json({ error: "User not logged in" });
    }
    console.log(user.id, "<<Logout User");
    // 2. Check if user exists
    const existsUser = await User.findByPk(user.id);
    console.log(existsUser, "<<existsUser>>");
    if (!existsUser) {
      return res.status(404).json({ error: "User not found" });
    }
    req.user = existsUser;
    console.log(req.user.id, existsUser, "<<Logout User id>>");
    next();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function validateUpdateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { email, password, role } = req.body;

    // 1. Check if id is provided
    if (!id) {
      return res.status(400).json({ error: "id is required for update" });
    }

    // 2. Check if user exists
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!role) {
      return res.status(401).json({ error: "Roole is not defined" });
    }

    // 4. Optional: Check password length if provided
    if (password && password.length < 3) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    // 5. Attach user to request for controller
    req.user = user;

    next();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function validateDeleteUser(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    console.log(id, "<<id>>");

    // 1. Check if id is valid number
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // 2. Check if user exists
    const user = await User.findByPk(id);
    console.log(user, "User not founds");
    if (!user) {
      return res.status(404).json({ error: "User not foundss" });
    }

    // Attach user to request for controller
    req.user = user;
    console.log(req.user.id, "<<req.user.id>>");

    next();
  } catch (err) {
    return res.status(500).json({ error: err.message }, "de");
  }
}

async function validateResetPassword(req, res, next) {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // 1. Check if password is provided
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    // 2. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // 3. Check if user exists
    const user = await User.findOne({ where: { email: decoded.email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 4. Attach user and password to req for controller
    req.user = user;
    req.newPassword = password;

    next();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function validateForgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    next();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    // userRole should come from the JOINED Role table (e.g., user.Role.name)
    const userRole = req.loginUser.Role
      ? req.loginUser.Role.name.toLowerCase()
      : null;

    console.log(req.loginUser.Role, "<<Full Role Object>>");
    console.log(userRole, "<<Extracted Role Name>>");

    // Convert allowed roles to lowercase for case-insensitive comparison
    const allowedRolesLower = allowedRoles.map((r) => r.toLowerCase());

    if (!userRole || !allowedRolesLower.includes(userRole)) {
      console.log(allowedRoles, "allowedRoles");
      return res.status(403).json({ error: "Access deniedssssss" });
    }

    next();
  };
}

module.exports = {
  auth,
  validateLogin,
  validateSignup,
  validateUpdateUser,
  validateDeleteUser,
  validateLogout,
  validateResetPassword,
  validateForgotPassword,
  authorizeRoles,
};
