const express = require("express");
const router = express.Router();
const connection = require("../db");

function generateId() {
  const maxId = 999999999;
  const minId = 100000000;
  const id = Math.floor(Math.random() * (maxId - minId + 1)) + minId;
  return id;
}

router.get("/getAll", async (req, res) => {
  try {
    connection.query("SELECT * FROM user_screens", (err, results, fields) => {
      if (err) {
        console.log(err);
        return res.status(400).send();
      }
      res.status(200).json(results);
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

//* GET one by user_id
router.get("/getOneUserID/:user_id", async (req, res) => {
  const user_id = req.params.user_id;
  try {
    connection.query(
      "SELECT * FROM user_screens WHERE user_id = ?",
      [user_id],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          return res.status(400).send();
        }
        res.status(200).json(results);
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

// GET screens by project_id, system_id, and user_id
router.get("/getScreensByUserProjectSystem/:project_id/:system_id/:user_id", async (req, res) => {
  const { project_id, system_id, user_id } = req.params;

  try {
    connection.query(
      `SELECT screens.* 
             FROM user_screens 
             INNER JOIN screens ON user_screens.screen_id = screens.id 
             WHERE user_screens.project_id = ? 
             AND user_screens.system_id = ? 
             AND user_screens.user_id = ? 
             AND screens.is_deleted = 0`,
      [project_id, system_id, user_id],
      (err, results) => {
        if (err) {
          console.error(err);
          return res.status(400).send("Error fetching screens.");
        }
        res.status(200).json(results);
      }
    );
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error.");
  }
});

//* GET one by screen_id
router.get("/getOneScreenID/:screen_id", async (req, res) => {
  const screen_id = req.params.screen_id;
  try {
    connection.query(
      "SELECT users.id, users.user_firstname, users.user_position, users.user_pic FROM user_screens INNER JOIN users ON user_screens.user_id = users.id INNER JOIN screens ON user_screens.screen_id = screens.id WHERE user_screens.screen_id = ?",
      [screen_id],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          return res.status(400).send();
        }
        res.status(200).json(results);
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});
router.post("/takeScreen", async (req, res) => {
  const { user_id, screen_id, system_id, project_id } = req.body;

  try {
    // สร้าง ID สำหรับรายการใหม่ใน user_screens
    const id = generateId();

    // เพิ่มหน้าจอลงในระบบโดยใช้ข้อมูลที่ส่งมาจาก body
    connection.query(
      "INSERT INTO user_screens (id, user_id, screen_id, system_id, project_id) VALUES (?, ?, ?, ?, ?)",
      [id, user_id, screen_id, system_id, project_id],
      (err, results, fields) => {
        if (err) {
          console.log("Error while taking a screen:", err);
          return res.status(500).send();
        }
        return res.status(201).json({ message: "Screen taken successfully!" });
      }
    );
  } catch (err) {
    console.log("Error while taking a screen:", err);
    return res.status(500).send();
  }
});

// * POST FROM user_screens
router.post("/createUser_screen", async (req, res) => {
  const { user_id, screen_id, system_id, project_id } = req.body;

  try {
    for (let i = 0; i < user_id.length; i++) {
      const id = generateId();
      // screen_id exists in the screens table, insert new record into user_screens table
      connection.query(
        "INSERT INTO user_screens(id, user_id, screen_id,system_id,project_id) VALUES(?, ?, ?, ?, ?)",
        [id, user_id[i], screen_id, system_id, project_id],
        (err, results, fields) => {
          if (err) {
            console.log(
              "Error while inserting a screen into the database",
              err
            );
            return;
          }
        }
      );
    }
    return res
      .status(201)
      .json({ message: "New user_screens successfully created!" });
  } catch (err) {
    console.log("Error while inserting user_screen(s) into the database", err);
    return res.status(400).send();
  }
});

// * Put FROM user_screen by user_id
router.put("/updateUserID/:user_id", async (req, res) => {
  const user_id = req.params.user_id;
  const { screen_id } = req.body;
  try {
    connection.query(
      "UPDATE user_screens SET screen_id = ? WHERE user_id = ?",
      [screen_id, user_id],
      (err, results, fields) => {
        if (err) {
          console.log("Error update user_screen into the database", err);
          return res.status(400).send();
        }
        return res
          .status(201)
          .json({ message: "Update user_screen successfully" });
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

// * Put FROM user_screen by screen_id
router.put("/updateUserID/:screen_id", async (req, res) => {
  const screen_id = req.params.screen_id;
  const { user_id } = req.body;
  try {
    // Retrieve current user_ids associated with the screen_id
    const current_user_ids = await new Promise((resolve, reject) => {
      connection.query(
        "SELECT user_id FROM user_screens WHERE screen_id = ?",
        [screen_id],
        (err, results, fields) => {
          if (err) {
            console.log("Error retrieving current user_ids", err);
            reject(err);
          } else {
            const current_user_ids = results.map((result) => result.user_id);
            resolve(current_user_ids);
          }
        }
      );
    });
    // Compare current user_ids with updated user_ids
    const to_delete = current_user_ids.filter(
      (current_user_id) => !user_id.includes(current_user_id)
    );
    // Delete any user_id that is in the current user_ids array but not in the updated user_ids array
    if (to_delete.length > 0) {
      await new Promise((resolve, reject) => {
        connection.query(
          "DELETE FROM user_screens WHERE screen_id = ? AND user_id IN (?)",
          [screen_id, to_delete],
          (err, results, fields) => {
            if (err) {
              console.log("Error deleting user_ids from user_screens", err);
              reject(err);
            } else {
              resolve();
            }
          }
        );
      });
    }
    // Update user_ids
    for (let i = 0; i < user_id.length; i++) {
      await new Promise((resolve, reject) => {
        connection.query(
          "INSERT INTO user_screens (screen_id, user_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE user_id = ?",
          [screen_id, user_id[i], user_id[i]],
          (err, results, fields) => {
            if (err) {
              console.log("Error updating user_screen into the database", err);
              reject(err);
            } else {
              resolve();
            }
          }
        );
      });
    }

    return res.status(201).json({
      message: "Update user_screen successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

//* DELETE user by user_id
router.delete("/deleteUserID/:user_id", async (req, res) => {
  const user_id = req.params.user_id;

  try {
    connection.query(
      "DELETE FROM user_screens WHERE user_id = ?",
      [user_id],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          return res.status(400).send();
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ message: "No user_id with that" });
        }
        return res
          .status(200)
          .json({ message: "user_id deleted successfully!" });
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

//* DELETE user by screen_id
router.delete("/deleteScreenID/:screen_id", async (req, res) => {
  const screen_id = req.params.screen_id;

  try {
    connection.query(
      "DELETE FROM user_screens WHERE screen_id = ?",
      [screen_id],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          return res.status(400).send();
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ message: "No screen_id with that" });
        }
        return res
          .status(200)
          .json({ message: "screen_id deleted successfully!" });
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

//* DELETE user by system_id
router.delete("/deleteSystemID/:system_id", async (req, res) => {
  const system_id = req.params.system_id;

  try {
    connection.query(
      "DELETE FROM user_screens WHERE system_id = ?",
      [system_id],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          return res.status(400).send();
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ message: "No system_id with that" });
        }
        return res
          .status(200)
          .json({ message: "screen_id deleted successfully!" });
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

//* DELETE user by project_id
router.delete("/deleteProjectID/:project_id", async (req, res) => {
  const project_id = req.params.project_id;

  try {
    connection.query(
      "DELETE FROM user_screens WHERE project_id = ?",
      [project_id],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          return res.status(400).send();
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ message: "No project_id with that" });
        }
        return res
          .status(200)
          .json({ message: "project_id deleted successfully!" });
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.get(
  "/checkUsersNOTINScreen/:project_id/:system_id/:screen_id",
  async (req, res) => {
    const { project_id, system_id, screen_id } = req.params;

    try {
      // Query to find users in the specified screen
      const query = `
            SELECT users.id, users.user_firstname, users.user_lastname, users.user_position, users.user_department, users.user_pic
            FROM users
            LEFT JOIN user_systems ON users.id = user_systems.user_id
            WHERE user_systems.project_id = ? AND user_systems.system_id = ?
            AND users.id NOT IN (
                SELECT user_id FROM user_screens
                WHERE project_id = ? AND system_id = ? AND screen_id = ?
            )
        `;

      // Execute the query
      connection.query(
        query,
        [project_id, system_id, project_id, system_id, screen_id],
        (err, results, fields) => {
          if (err) {
            console.log(err);
            return res.status(500).send();
          }
          // Send the response with the list of users not in the screen
          res.status(200).json(results);
        }
      );
    } catch (err) {
      console.log(err);
      return res.status(500).send();
    }
  }
);

router.get(
  "/checkUsersINScreen/:project_id/:system_id/:screen_id",
  async (req, res) => {
    const { project_id, system_id, screen_id } = req.params;

    try {
      // Query to find users in the specified screen
      const query = `
            SELECT users.id, users.user_firstname, users.user_lastname, users.user_position, users.user_department, users.user_pic
            FROM users
            INNER JOIN user_screens ON users.id = user_screens.user_id
            WHERE user_screens.project_id = ? AND user_screens.system_id = ? AND user_screens.screen_id = ?
        `;

      // Execute the query
      connection.query(
        query,
        [project_id, system_id, screen_id],
        (err, results, fields) => {
          if (err) {
            console.log(err);
            return res.status(500).send();
          }
          // Send the response with the list of users in the screen
          res.status(200).json(results);
        }
      );
    } catch (err) {
      console.log(err);
      return res.status(500).send();
    }
  }
);

router.delete(
  "/deleteUserScreen/:system_id/:project_id/:screen_id/:user_id",
  async (req, res) => {
    const { system_id, project_id, screen_id, user_id } = req.params;

    try {
      // Query to delete user_screen by system_id, project_id, screen_id, and user_id
      const query = `
            DELETE FROM user_screens
            WHERE system_id = ? AND project_id = ? AND screen_id = ? AND user_id = ?
        `;

      // Execute the query
      connection.query(
        query,
        [system_id, project_id, screen_id, user_id],
        (err, results, fields) => {
          if (err) {
            console.log(err);
            return res.status(500).send();
          }
          // Check if any user_screen was deleted
          if (results.affectedRows === 0) {
            return res.status(404).json({
              message: "No user_screen found with the provided details.",
            });
          }
          // Send success response
          return res
            .status(200)
            .json({ message: "User_screen deleted successfully." });
        }
      );
    } catch (err) {
      console.log(err);
      return res.status(500).send();
    }
  }
);
//* GET user details by screen_id
router.get("/getUserScreenByScreenId/:screen_id", async (req, res) => {
  const screen_id = req.params.screen_id;

  try {
    // Query to find user_ids by screen_id
    const queryUserIds = `
      SELECT user_id
      FROM user_screens
      WHERE screen_id = ?
    `;

    const userIds = await new Promise((resolve, reject) => {
      connection.query(queryUserIds, [screen_id], (err, results) => {
        if (err) {
          console.log("Error retrieving user_ids from user_screens", err);
          return reject(err);
        }
        resolve(results.map((row) => row.user_id));
      });
    });

    if (userIds.length === 0) {
      return res
        .status(404)
        .json({ message: "No users found for the given screen_id" });
    }

    // Query to find user details based on user_ids
    const queryUserDetails = `
      SELECT id, user_firstname, user_lastname, user_position, user_department, user_pic
      FROM users
      WHERE id IN (?)
    `;

    connection.query(queryUserDetails, [userIds], (err, results) => {
      if (err) {
        console.log("Error retrieving user details from users", err);
        return res.status(500).send();
      }

      res.status(200).json(results);
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

module.exports = router;
