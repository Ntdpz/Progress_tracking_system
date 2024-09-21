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

// ฟังก์ชันสำหรับอัปเดตข้อมูล screen ในฐานข้อมูล
async function updateScreen(screen) {
  try {
    // กำหนดค่า default ให้กับ screen_progress หากเป็น null หรือ undefined
    if (
      screen.screen_progress === null ||
      screen.screen_progress === undefined
    ) {
      screen.screen_progress = 0; // ค่า default, สามารถเปลี่ยนแปลงได้ตามต้องการ
    }

    const updateQuery = `
      UPDATE screens
      SET 
        screen_progress = ?, 
        screen_progress_status_design = ?, 
        screen_progress_status_dev = ?, 
        screen_plan_start = ?, 
        screen_plan_end = ?, 
        task_count = ?
      WHERE id = ?
    `;

    // ค่า parameter ที่ต้องการส่งให้กับ query
    const params = [
      screen.screen_progress,
      screen.screen_progress_status_design || 0, // กำหนดค่า default เป็น 0 หากเป็น undefined หรือ null
      screen.screen_progress_status_dev || 0, // กำหนดค่า default เป็น 0 หากเป็น undefined หรือ null
      screen.screen_plan_start,
      screen.screen_plan_end,
      screen.task_count || 0, // กำหนดค่า default เป็น 0 หากเป็น undefined หรือ null
      screen.id,
    ];

    // ทำการอัปเดต screen ในฐานข้อมูล
    await new Promise((resolve, reject) => {
      connection.query(updateQuery, params, (err, results) => {
        if (err) {
          console.error(err);
          return reject(err);
        }
        resolve(results);
      });
    });
  } catch (error) {
    console.error("Error updating screen:", error);
    throw error;
  }
}


router.get("/getAll", async (req, res) => {
  try {
    const systemIDFilter = req.query.system_id;
    const screenIDFilter = req.query.screen_code;
    const projectIDFilter = req.query.project_id;

    let query = `
      SELECT
          screens.*,
          CAST(
              (COALESCE(AVG(CASE WHEN tasks.task_type = 'Design' THEN tasks.task_progress ELSE NULL END), 0) + COALESCE(AVG(CASE WHEN tasks.task_type = 'Develop' THEN tasks.task_progress ELSE NULL END), 0))
              / 2 AS DECIMAL(10,0)
          ) AS screen_progress,
          CAST(COALESCE(AVG(CASE WHEN tasks.task_type = 'Design' THEN tasks.task_progress ELSE NULL END), 0) AS DECIMAL(10,0)) AS screen_progress_status_design,
          CAST(COALESCE(AVG(CASE WHEN tasks.task_type = 'Develop' THEN tasks.task_progress ELSE NULL END), 0) AS DECIMAL(10,0)) AS screen_progress_status_dev,
          COUNT(tasks.id) AS task_count,
          MIN(tasks.task_plan_start) AS min_task_plan_start,
          MAX(tasks.task_plan_end) AS max_task_plan_end
      FROM
          screens
      LEFT JOIN tasks ON screens.id = tasks.screen_id
      WHERE
          screens.is_deleted = 0
    `;

    const queryParams = [];

    // Add filters to the query based on request parameters
    if (systemIDFilter) {
      query += " AND screens.system_id = ?";
      queryParams.push(systemIDFilter);
    }
    if (screenIDFilter) {
      query += " AND screens.screen_code = ?";
      queryParams.push(screenIDFilter);
    }
    if (projectIDFilter) {
      query += " AND screens.project_id = ?";
      queryParams.push(projectIDFilter);
    }

    query += " GROUP BY screens.id";

    // Execute the query
    connection.query(query, queryParams, async (err, results, fields) => {
      if (err) {
        console.log(err);
        return res.status(400).send();
      }

      // Process results to format dates and update screens
      for (const screen of results) {
        // Format date fields
        if (screen.min_task_plan_start && screen.max_task_plan_end) {
          screen.screen_plan_start = new Date(screen.min_task_plan_start)
            .toISOString()
            .split("T")[0];
          screen.screen_plan_end = new Date(screen.max_task_plan_end)
            .toISOString()
            .split("T")[0];
        }

        // Update screen data in the database
        const updateQuery = `
          UPDATE screens
          SET screen_progress = ?, 
              screen_progress_status_design = ?, 
              screen_progress_status_dev = ?, 
              screen_plan_start = ?, 
              screen_plan_end = ?
          WHERE id = ?
        `;

        const updateParams = [
          screen.screen_progress,
          screen.screen_progress_status_design,
          screen.screen_progress_status_dev,
          screen.screen_plan_start,
          screen.screen_plan_end,
          screen.id
        ];

        try {
          await new Promise((resolve, reject) => {
            connection.query(updateQuery, updateParams, (updateErr, updateResults) => {
              if (updateErr) {
                console.error(updateErr);
                reject(updateErr);
              } else {
                resolve(updateResults);
              }
            });
          });
        } catch (updateErr) {
          console.error(updateErr);
        }
      }

      // Send the response with the results
      res.status(200).json(results);
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});



router.get("/getOne/:id", async (req, res) => {
  try {
    const { id } = req.params;

    let query = `
      SELECT
        screens.*,
        CAST(
              (COALESCE(AVG(CASE WHEN tasks.task_type = 'Design' THEN tasks.task_progress ELSE NULL END), 0) + COALESCE(AVG(CASE WHEN tasks.task_type = 'Develop' THEN tasks.task_progress ELSE NULL END), 0))
              / 2 AS DECIMAL(10,0)
          ) AS screen_progress,
          CAST(COALESCE(AVG(CASE WHEN tasks.task_type = 'Design' THEN tasks.task_progress ELSE NULL END), 0) AS DECIMAL(10,0)) AS screen_progress_status_design,
          CAST(COALESCE(AVG(CASE WHEN tasks.task_type = 'Develop' THEN tasks.task_progress ELSE NULL END), 0) AS DECIMAL(10,0)) AS screen_progress_status_dev,
          COUNT(tasks.id) AS task_count,
          MIN(tasks.task_plan_start) AS min_task_plan_start,
          MAX(tasks.task_plan_end) AS max_task_plan_end,
          DATEDIFF(MAX(tasks.task_plan_end), MIN(tasks.task_plan_start)) AS screen_manday
      FROM
        screens
      LEFT JOIN tasks ON screens.id = tasks.screen_id
    `;

    query += ` WHERE screens.id = ? AND screens.is_deleted = 0`;

    query += " GROUP BY screens.id";

    connection.query(query, [id], async (err, results, fields) => {
      if (err) {
        console.log(err);
        return res.status(400).send();
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "No screen with that ID!" });
      }

      results.forEach(async (screen) => {
        if (screen.min_task_plan_start && screen.max_task_plan_end) {
          screen.screen_plan_start = new Date(screen.min_task_plan_start)
            .toISOString()
            .split("T")[0];
          screen.screen_plan_end = new Date(screen.max_task_plan_end)
            .toISOString()
            .split("T")[0];
        }

        // Update screen_manday in the database
        const updateQuery = `
          UPDATE screens
          SET screen_manday = ?
          WHERE id = ?
        `;

        connection.query(updateQuery, [screen.screen_manday, screen.id], (updateErr, updateResults) => {
          if (updateErr) {
            console.error(updateErr);
          }
        });

        // Update other screen data in the database (if needed)
        try {
          await updateScreen(screen);
        } catch (updateErr) {
          console.error(updateErr);
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
      FROM screens
      WHERE is_deleted = 1
       DATEDIFF(MAX(tasks.task_plan_end), MIN(tasks.task_plan_start)) AS screen_manday
    `;

    connection.query(query, async (err, results, fields) => {
      if (err) {
        console.log(err);
        return res.status(400).send();
      }
      await Promise.all(
        results.map(async (screen) => {
          try {
            await updateScreen(screen);
          } catch (updateErr) {
            console.error(updateErr);
          }
        })
      );

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
        screens.*,
        AVG(tasks.task_progress) AS screen_progress,
        AVG(CASE WHEN tasks.task_type = 'Design' THEN tasks.task_progress ELSE NULL END) AS screen_progress_status_design,
        AVG(CASE WHEN tasks.task_type = 'Develop' THEN tasks.task_progress ELSE NULL END) AS screen_progress_status_dev,
        DATE(MIN(tasks.task_plan_start)) AS min_task_plan_start,
        DATE(MAX(tasks.task_plan_end)) AS max_task_plan_end,
        DATEDIFF(MAX(tasks.task_plan_end), MIN(tasks.task_plan_start)) AS screen_manday
      FROM
        screens
      LEFT JOIN tasks ON screens.id = tasks.screen_id
      WHERE screens.project_id = ? AND screens.is_deleted = 0
      GROUP BY screens.id
    `;

    connection.query(query, [project_id], async (err, results, fields) => {
      if (err) {
        console.log(err);
        return res.status(400).send();
      }
      // Update screen_manday in the database
      const updateQuery = `
          UPDATE screens
          SET screen_manday = ?
          WHERE id = ?
        `;

      connection.query(updateQuery, [screen.screen_manday, screen.id], (updateErr, updateResults) => {
        if (updateErr) {
          console.error(updateErr);
        }
      });
      // Update each screen after fetching results
      await Promise.all(
        results.map(async (screen) => {
          if (screen.min_task_plan_start && screen.max_task_plan_end) {
            screen.screen_plan_start = new Date(screen.min_task_plan_start)
              .toISOString()
              .split("T")[0];
            screen.screen_plan_end = new Date(screen.max_task_plan_end)
              .toISOString()
              .split("T")[0];
          }

          // Call the updateScreen function
          try {
            await updateScreen(screen);
          } catch (updateErr) {
            console.error("Failed to update screen:", updateErr);
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
        screens.*,
        AVG(tasks.task_progress) AS screen_progress,
        AVG(CASE WHEN tasks.task_type = 'Design' THEN tasks.task_progress ELSE NULL END) AS screen_progress_status_design,
        AVG(CASE WHEN tasks.task_type = 'Develop' THEN tasks.task_progress ELSE NULL END) AS screen_progress_status_dev,
        DATE(MIN(screens.screen_plan_start)) AS screen_plan_start,
        DATE(MAX(screens.screen_plan_end)) AS screen_plan_end,
        DATEDIFF(MAX(tasks.task_plan_end), MIN(tasks.task_plan_start)) AS screen_manday

      FROM
        screens
      LEFT JOIN tasks ON screens.id = tasks.screen_id
      WHERE screens.project_id = ? AND screens.is_deleted = 1
      GROUP BY screens.id
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
        screens.*,
        AVG(tasks.task_progress) AS screen_progress,
        AVG(CASE WHEN tasks.task_type = 'Design' THEN tasks.task_progress ELSE NULL END) AS screen_progress_status_design,
        AVG(CASE WHEN tasks.task_type = 'Develop' THEN tasks.task_progress ELSE NULL END) AS screen_progress_status_dev,
        DATE(MIN(screens.screen_plan_start)) AS screen_plan_start,
        DATE(MAX(screens.screen_plan_end)) AS screen_plan_end,
        DATEDIFF(MAX(tasks.task_plan_end), MIN(tasks.task_plan_start)) AS screen_manday
      FROM
        screens
      LEFT JOIN tasks ON screens.id = tasks.screen_id
      WHERE screens.system_id = ? AND screens.is_deleted = 0
      GROUP BY screens.id
    `;

    connection.query(query, [system_id], async (err, results, fields) => {
      if (err) {
        console.log(err);
        return res.status(400).send();
      }

      try {
        // อัปเดต screen_manday ในฐานข้อมูล
        const updateQueries = results.map(screen => {
          return new Promise((resolve, reject) => {
            const updateQuery = `
              UPDATE screens
              SET screen_manday = ?
              WHERE id = ?
            `;
            connection.query(updateQuery, [screen.screen_manday, screen.id], (updateErr, updateResults) => {
              if (updateErr) {
                return reject(updateErr);
              }
              resolve(updateResults);
            });
          });
        });

        await Promise.all(updateQueries);

        // อัปเดตข้อมูลอื่นๆ
        const updatedResults = await Promise.all(
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

        res.status(200).json(updatedResults);
      } catch (updateErr) {
        console.error(updateErr);
        res.status(500).send();
      }
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
        screens.*,
        AVG(tasks.task_progress) AS screen_progress,
        AVG(CASE WHEN tasks.task_type = 'Design' THEN tasks.task_progress ELSE NULL END) AS screen_progress_status_design,
        AVG(CASE WHEN tasks.task_type = 'Develop' THEN tasks.task_progress ELSE NULL END) AS screen_progress_status_dev,
        DATE(MIN(screens.screen_plan_start)) AS screen_plan_start,
        DATE(MAX(screens.screen_plan_end)) AS screen_plan_end,
        DATEDIFF(MAX(tasks.task_plan_end), MIN(tasks.task_plan_start)) AS screen_manday
      FROM
        screens
      LEFT JOIN tasks ON screens.id = tasks.screen_id
      WHERE screens.system_id = ? AND screens.is_deleted = 1
      GROUP BY screens.id
    `;

    connection.query(query, [system_id], async (err, results, fields) => {
      if (err) {
        console.log(err);
        return res.status(400).send();
      }

      try {
        // Perform updates in sequence
        for (const screen of results) {
          // Update screen_manday in the database
          const updateQuery = `
            UPDATE screens
            SET screen_manday = ?
            WHERE id = ?
          `;

          // Perform the update
          await new Promise((resolve, reject) => {
            connection.query(updateQuery, [screen.screen_manday, screen.id], (updateErr, updateResults) => {
              if (updateErr) {
                return reject(updateErr);
              }
              resolve(updateResults);
            });
          });

          // Call updateScreen function
          await updateScreen(screen);
        }

        res.status(200).json(results);
      } catch (updateErr) {
        console.error(updateErr);
        res.status(500).send();
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});


router.post("/createScreen", async (req, res) => {
  const {
    screen_code,
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
    // Generate random screen_code
    const id = generateId(); // Assume this function generates a unique screen ID

    // Insert screen data into screens table
    const insertScreenQuery =
      "INSERT INTO screens (id, screen_code, screen_name, screen_status, screen_level, system_id, screen_progress, screen_plan_start, screen_plan_end, project_id, screen_pic) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    await new Promise((resolve, reject) => {
      connection.query(
        insertScreenQuery,
        [
          id,
          screen_code,
          screen_name,
          screen_status,
          screen_level,
          system_id,
          screen_progress,
          screen_plan_start,
          screen_plan_end,
          project_id,
          req.body.screen_pic,
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
                id,
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
    screen_code,
    screen_name,
    screen_status,
    screen_level,
    screen_pic,
    project_id,
    is_deleted,
  } = req.body;

  const updatedScreen = {
    screen_code,
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
          screen_code: screen_code || existingScreen.screen_code,
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
