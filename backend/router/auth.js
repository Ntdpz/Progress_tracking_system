const express = require("express");
const cors = require("cors");

const app = express();
const router = express.Router();
const mysql = require("mysql");
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const db = require("../db");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

// Login route
router.post("/api/login", (req, res) => {
  const { user_id, user_password } = req.body;

  db.query(
    "SELECT * FROM users WHERE user_id = ?",
    [user_id],
    (error, results) => {
      if (error) {
        console.error("Database query error:", error);
        return res.status(500).json({ message: "Database error" });
      }

      if (results.length === 1) {
        const user = results[0];
        console.log("user", user);
        if (user.user_password === user_password) {
          const token = jwt.sign(
            { id: user.id, firstname: user.user_firstname },
            "secret_key",
            { expiresIn: "1h" }
          );
          res.json({ token });
        } else {
          res.status(401).json({ message: "Invalid user_password" });
        }
      } else {
        res.status(401).json({ message: "User not found" });
      }
    }
  );
});


router.get("/api/me", (req, res) => {
  const token = req.headers.authorization.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, "secret_key");
    db.query(
      "SELECT id, user_firstname,user_lastname user_position, user_role FROM users WHERE id = ?",
      [decoded.id],
      (error, results) => {
        if (error) {
          console.error("Database query error:", error);
          return res.status(500).json({ message: "Database error" });
        }

        if (results.length === 1) {
          const user = results[0];
          res.json({ user });
          console.log("user", user);
        } else {
          res.status(401).json({ message: "User not found" });
        }
      }
    );
    // res.json(decoded);
  } catch (err) {
    console.error("JWT verification error:", err);
    res.status(401).json({ message: "Invalid token" });
  }
});

router.post("/api/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      res.status(500).json({ message: "Error logging out." });
    } else {
      res.json({});
    }
  });
});

module.exports = router;
