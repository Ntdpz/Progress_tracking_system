// Importing required modules
const express = require("express"); // Import Express module
const router = express.Router(); // Create router
const moment = require("moment"); // Import Moment module for date manipulation

// Import database connection
const connection = require("../db");

// Multer for file uploads
const multer = require("multer");

// File system and path modules for file management
const fs = require("fs");
const path = require("path");

// UUID and crypto for generating UUIDs and encryption
const uuid = require("uuid");
const crypto = require("crypto");

// Multer disk storage configuration
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "../frontend/static/screenImages/"); // Destination folder for file uploads
  },
  filename(req, file, cb) {
    // Generate new file name using UUID and timestamp
    const originalname = file.originalname;
    const filename =
      uuid.v4() +
      "-" +
      Date.now() +
      "-" +
      originalname.substring(originalname.lastIndexOf("/") + 1);
    cb(null, filename);
  },
});

// Multer upload configuration
const upload = multer({ storage });

// Default image name
const defaultName = "../frontend/static/screenImages/DefaultScreen.jpg";
const defaultImage = defaultName.substring(defaultName.lastIndexOf("/") + 1);

// Function to generate random ID
function generateId() {
  const maxId = 999999999;
  const minId = 100000000;
  const id = Math.floor(Math.random() * (maxId - minId + 1)) + minId;
  return id;
}

// Route to get all screens
router.get("/getAll", async (req, res) => {
  try {
    const systemIDFilter = req.query.system_id;
    const screenIDFilter = req.query.screen_id;
    const projectIDFilter = req.query.project_id;

    let query = `
      SELECT
          Screens.*,
          AVG(tasks.task_progress) AS screen_progress,
          DATE(MIN(tasks.task_plan_start)) AS screen_plan_start,
          DATE(MAX(tasks.task_plan_end)) AS screen_plan_end,
          DATEDIFF(MAX(tasks.task_plan_end), MIN(tasks.task_plan_start)) AS screen_manday
      FROM
          Screens
      LEFT JOIN tasks ON Screens.id = tasks.screen_id
      WHERE
          Screens.is_deleted = 0
    `;

    const queryParams = [];

    if (systemIDFilter) {
      query += " AND Screens.system_id = ?";
      queryParams.push(systemIDFilter);
    } else if (screenIDFilter) {
      query += " AND Screens.screen_id = ?";
      queryParams.push(screenIDFilter);
    } else if (projectIDFilter) {
      query += " AND Screens.project_id = ?";
      queryParams.push(projectIDFilter);
    }

    query += " GROUP BY Screens.id";

    connection.query(query, queryParams, async (err, results, fields) => {
      if (err) {
        console.log(err);
        return res.status(400).send();
      }

      const screensWithTasks = await Promise.all(
        results.map(async (screen) => {
          await updateScreen(screen);

          // Format dates and fix discrepancy
          screen.screen_plan_start = new Date(screen.screen_plan_start)
            .toISOString()
            .split("T")[0];
          screen.screen_plan_end = new Date(screen.screen_plan_end)
            .toISOString()
            .split("T")[0];
          const startDate = new Date(screen.screen_plan_start);
          startDate.setDate(startDate.getDate() + 1);
          screen.screen_plan_start = startDate.toISOString().split("T")[0];
          const endDate = new Date(screen.screen_plan_end);
          endDate.setDate(endDate.getDate() + 1);
          screen.screen_plan_end = endDate.toISOString().split("T")[0];

          return screen;
        })
      );

      res.status(200).json(screensWithTasks);
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

// Function to update screen data
async function updateScreen(screen) {
  try {
    const updateQuery = `
      UPDATE screens 
      SET 
        screen_progress = ?,
        screen_plan_start = ?, 
        screen_plan_end = ?,
        task_count = ?
      WHERE id = ?
    `;

    const queryParams = [
      screen.screen_progress,
      screen.screen_plan_start,
      screen.screen_plan_end,
      screen.task_count,
      screen.id,
    ];

    await new Promise((resolve, reject) => {
      connection.query(updateQuery, queryParams, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  } catch (error) {
    throw error;
  }
}

// Route to get one screen by ID
router.get("/getOne/:id", async (req, res) => {
  try {
    const { id } = req.params;

    let query = `
      SELECT
        Screens.*,
        AVG(tasks.task_progress) AS screen_progress,
        COUNT(tasks.id) AS task_count,
        DATE(MIN(tasks.task_plan_start)) AS screen_plan_start,
          DATE(MAX(tasks.task_plan_end)) AS screen_plan_end,
          DATEDIFF(MAX(tasks.task_plan_end), MIN(tasks.task_plan_start)) AS screen_manday
      FROM
        Screens
      LEFT JOIN tasks ON Screens.id = tasks.screen_id
    `;

    query += ` WHERE Screens.id = ? AND Screens.is_deleted = 0`;

    query += " GROUP BY Screens.id";

    connection.query(query, [id], async (err, results, fields) => {
      if (err) {
        console.log(err);
        return res.status(400).send();
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "No screen with that ID!" });
      }

      results.forEach((screen) => {
        if (screen.screen_plan_start) {
          screen.screen_plan_start = new Date(screen.screen_plan_start)
            .toISOString()
            .split("T")[0];
        }
        if (screen.screen_plan_end) {
          screen.screen_plan_end = new Date(screen.screen_plan_end)
            .toISOString()
            .split("T")[0];
        }
      });

      res.status(200).json(results);
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

// Route to get all historical screens
router.get("/getAllHistoryScreens", async (req, res) => {
  try {
    const query = `
      SELECT *
      FROM Screens
      WHERE is_deleted = 1
    `;

    connection.query(query, async (err, results, fields) => {
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

// Route to get screens by project ID
router.get("/searchByProjectId/:project_id", async (req, res) => {
  try {
    const { project_id } = req.params;

    let query = `
      SELECT
        Screens.*,
        AVG(tasks.task_progress) AS screen_progress,
        DATE(MIN(Screens.screen_plan_start)) AS screen_plan_start,
        DATE(MAX(Screens.screen_plan_end)) AS screen_plan_end,
        DATEDIFF(MAX(tasks.task_plan_end), MIN(tasks.task_plan_start)) AS screen_manday
      FROM
        Screens
      LEFT JOIN tasks ON Screens.id = tasks.screen_id
      WHERE Screens.project_id = ? AND Screens.is_deleted = 0
      GROUP BY Screens.id
    `;

    connection.query(query, [project_id], async (err, results, fields) => {
      if (err) {
        console.log(err);
        return res.status(400).send();
      }

      await Promise.all(
        results.map(async (screen) => {
          await updateScreen(screen);
          if (screen.screen_plan_start) {
            screen.screen_plan_start = new Date(screen.screen_plan_start)
              .toISOString()
              .split("T")[0];
          }
          if (screen.screen_plan_end) {
            screen.screen_plan_end = new Date(screen.screen_plan_end)
              .toISOString()
              .split("T")[0];
          }
          return screen;
        })
      );

      res.status(200).json(results);
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

// Route to get deleted screens by project ID
router.get("/searchByProjectId_delete/:project_id", async (req, res) => {
  try {
    const { project_id } = req.params;

    let query = `
      SELECT
        Screens.*,
        AVG(tasks.task_progress) AS screen_progress,
        DATE(MIN(Screens.screen_plan_start)) AS screen_plan_start,
        DATE(MAX(Screens.screen_plan_end)) AS screen_plan_end,
        DATEDIFF(MAX(tasks.task_plan_end), MIN(tasks.task_plan_start)) AS screen_manday
      FROM
        Screens
      LEFT JOIN tasks ON Screens.id = tasks.screen_id
      WHERE Screens.project_id = ? AND Screens.is_deleted = 1
      GROUP BY Screens.id
    `;

    connection.query(query, [project_id], async (err, results, fields) => {
      if (err) {
        console.log(err);
        return res.status(400).send();
      }

      await Promise.all(
        results.map(async (screen) => {
          await updateScreen(screen);
        })
      );

      res.status(200).json(results);
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

// Route to get screens by system ID
router.get("/searchBySystemId/:system_id", async (req, res) => {
  try {
    const { system_id } = req.params;

    let query = `
      SELECT
        Screens.*,
        AVG(tasks.task_progress) AS screen_progress,
        DATE(MIN(Screens.screen_plan_start)) AS screen_plan_start,
        DATE(MAX(Screens.screen_plan_end)) AS screen_plan_end,
        DATEDIFF(MAX(tasks.task_plan_end), MIN(tasks.task_plan_start)) AS screen_manday
      FROM
        Screens
      LEFT JOIN tasks ON Screens.id = tasks.screen_id
      WHERE Screens.system_id = ? AND Screens.is_deleted = 0
      GROUP BY Screens.id
    `;

    connection.query(query, [system_id], async (err, results, fields) => {
      if (err) {
        console.log(err);
        return res.status(400).send();
      }

      await Promise.all(
        results.map(async (screen) => {
          await updateScreen(screen);
        })
      );

      res.status(200).json(results);
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

// Route to get deleted screens by system ID
router.get("/searchBySystemId_delete/:system_id", async (req, res) => {
  try {
    const { system_id } = req.params;

    let query = `
      SELECT
        Screens.*,
        AVG(tasks.task_progress) AS screen_progress,
        DATE(MIN(Screens.screen_plan_start)) AS screen_plan_start,
        DATE(MAX(Screens.screen_plan_end)) AS screen_plan_end,
        DATEDIFF(MAX(tasks.task_plan_end), MIN(tasks.task_plan_start)) AS screen_manday
      FROM
        Screens
      LEFT JOIN tasks ON Screens.id = tasks.screen_id
      WHERE Screens.system_id = ? AND Screens.is_deleted = 1
      GROUP BY Screens.id
    `;

    connection.query(query, [system_id], async (err, results, fields) => {
      if (err) {
        console.log(err);
        return res.status(400).send();
      }

      await Promise.all(
        results.map(async (screen) => {
          await updateScreen(screen);
        })
      );

      res.status(200).json(results);
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.post("/createScreen", async (req, res) => {
  const {
    screen_id,
    screen_name,
    screen_status,
    screen_level,
    system_id,
    screen_progress,
    screen_plan_start,
    screen_plan_end,
    project_id,
    assignedUsers,
  } = req.body;

  try {
    // Generate random screen_id
    const id = generateId(); // Assume this function generates a unique screen ID

    // Insert screen data into screens table
    const insertScreenQuery =
      "INSERT INTO screens (id, screen_id, screen_name, screen_status, screen_level, system_id, screen_progress, screen_plan_start, screen_plan_end, project_id, screen_pic) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    await new Promise((resolve, reject) => {
      connection.query(
        insertScreenQuery,
        [
          id,
          screen_id,
          screen_name,
          screen_status,
          screen_level,
          system_id,
          screen_progress,
          screen_plan_start,
          screen_plan_end,
          project_id,
          req.body.screen_pic, // Insert Base64 image directly
        ],
        async (err, result) => {
          if (err) {
            console.error("Error inserting screen data:", err);
            return reject(err);
          }
          try {
            // Insert assigned users into user_screens table
            if (assignedUsers && assignedUsers.length > 0) {
              const insertUserScreenQuery =
                "INSERT INTO user_screens (user_id, screen_id, system_id, project_id) VALUES ?";

              const userScreenValues = assignedUsers.map((userId) => [
                userId,
                id, // Use the screen_id of the newly created screen
                system_id,
                project_id,
              ]);

              await new Promise((resolve, reject) => {
                connection.query(
                  insertUserScreenQuery,
                  [userScreenValues],
                  (err, result) => {
                    if (err) {
                      console.error("Error assigning users to screen:", err);
                      return reject(err);
                    }
                    resolve(result);
                  }
                );
              });
            }

            resolve(result);
          } catch (error) {
            reject(error);
          }
        }
      );
    });

    res.sendStatus(200);
  } catch (error) {
    console.error("Error creating screen:", error);
    res.sendStatus(500);
  }
});

router.put("/updateScreen/:id", (req, res) => {
  const id = req.params.id;
  const {
    screen_id,
    screen_name,
    screen_status,
    screen_level,
    screen_pic,
    project_id,
    is_deleted,
  } = req.body;

  const updatedScreen = {
    screen_id,
    screen_name,
    screen_status,
    screen_level,
    screen_pic,
    project_id,
    is_deleted,
  };

  try {
    connection.query(
      `SELECT * FROM screens WHERE id = ?`,
      [id],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          return res.status(400).send();
        }

        if (results.length === 0) {
          return res.status(404).json({ message: "Screen not found!" });
        }

        const existingScreen = results[0];
        const finalScreen = {
          screen_id: screen_id || existingScreen.screen_id,
          screen_name: screen_name || existingScreen.screen_name,
          screen_status: screen_status || existingScreen.screen_status,
          screen_level: screen_level || existingScreen.screen_level,
          screen_pic: screen_pic || existingScreen.screen_pic,
          project_id: project_id || existingScreen.project_id,
          is_deleted:
            is_deleted !== undefined ? is_deleted : existingScreen.is_deleted, // ใช้ค่า is_deleted ใหม่หรือค่าเดิมขึ้นอยู่กับการรับค่า is_deleted ใน req.body
        };

        connection.query(
          `UPDATE screens SET ? WHERE id = ?`,
          [finalScreen, id],
          (err, results, fields) => {
            if (err) {
              console.log(err);
              return res.status(400).send();
            }
            res.status(200).json({ message: "Screen updated successfully!" });
          }
        );
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

// Route to delete a screen by ID
router.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const selectSql = `SELECT * FROM screens WHERE id = ?`;
    const [screen] = await connection.promise().query(selectSql, [id]); // Use connection.promise().query() instead of connection.query()

    if (screen.length === 0) {
      return res.status(404).json({ message: "No screen with that id!" });
    }

    const updateSql = `UPDATE screens SET is_deleted = true WHERE id = ?`;
    await connection.promise().query(updateSql, [id]); // Use connection.promise().query() instead of connection.query()

    return res.status(200).json({ message: "Screen deleted successfully!" });
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
});

// Route to delete a screen by ID
router.delete("/deleteHistoryScreen/:id", async (req, res) => {
  const id = req.params.id;

  try {
    connection.query(
      "DELETE FROM screens WHERE id = ?",
      [id],
      async (err, results, fields) => {
        if (err) {
          console.error(err);
          return res.status(500).send();
        }

        return res
          .status(200)
          .json({ message: "Screen deleted successfully!" });
      }
    );
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
});

// Route to add multiple screens to a user
router.post("/addUserScreen", async (req, res) => {
  const { user_id, screen_ids } = req.body;
  try {
    const createUserScreens = (user_id, screen_ids) => {
      if (!Array.isArray(screen_ids)) {
        console.log("Error: screen_ids is not an array");
        return;
      }

      screen_ids.map((screen_id) => {
        connection.query(
          "INSERT INTO user_screens (user_id, screen_id) VALUES (?, ?)",
          [user_id, screen_id],
          (error, results, fields) => {
            if (error) {
              console.log(
                `Error while creating user-screen mapping for user ${user_id} and screen ${screen_id}`,
                error
              );
            }
          }
        );
      });
    };
    createUserScreens(user_id, screen_ids);
    return res.status(200).send("User-screen mappings created successfully");
  } catch (err) {
    console.log("Error while creating user-screen mappings", err);
    return res.status(500).send();
  }
});

module.exports = router;
