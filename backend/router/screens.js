// เรียกใช้โมดูล express และสร้าง router
const express = require("express");
const router = express.Router();
const moment = require('moment');


// เรียกใช้โมดูลเชื่อมต่อฐานข้อมูล
const connection = require("../db");

// เรียกใช้โมดูล multer สำหรับการอัปโหลดไฟล์
const multer = require("multer");

// เรียกใช้โมดูล fs และ path สำหรับการจัดการไฟล์
const fs = require("fs");
const path = require("path");

// เรียกใช้โมดูล uuid และ crypto สำหรับการสร้าง UUID และการเข้ารหัส
const uuid = require("uuid");
const crypto = require("crypto");

// กำหนดการเก็บรักษาไฟล์ด้วย multer.diskStorage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    // กำหนดโฟลเดอร์ปลายทางสำหรับการบันทึกไฟล์
    cb(null, "../frontend/static/screenImages/");
  },
  filename(req, file, cb) {
    // กำหนดชื่อไฟล์ใหม่โดยใช้ UUID และ timestamp
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

// กำหนดการอัปโหลดด้วย multer
const upload = multer({ storage });

// กำหนดชื่อไฟล์รูปภาพเริ่มต้น
const defaultName = "../frontend/static/screenImages/DefaultScreen.jpg";
const defaultImage = defaultName.substring(defaultName.lastIndexOf("/") + 1);

// ฟังก์ชันสำหรับสร้าง ID แบบสุ่ม
function generateId() {
  const maxId = 999999999;
  const minId = 100000000;
  const id = Math.floor(Math.random() * (maxId - minId + 1)) + minId;
  return id;
}
router.get("/getAll", async (req, res) => {
  try {
    const systemIDFilter = req.query.system_id;
    const idFilter = req.query.id;
    const screenIDFilter = req.query.screen_id;
    const screen_project_system_Filter = req.query.screen_id;
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
    `;

    const queryParams = [];
    if (systemIDFilter) {
      query += " WHERE system_id = ?";
      queryParams.push(systemIDFilter);
    } else if (idFilter) {
      query += " WHERE id = ?";
      queryParams.push(idFilter);
    } else if (screenIDFilter) {
      query += " WHERE screen_id = ?";
      queryParams.push(screenIDFilter);
    } else if (screen_project_system_Filter) {
      query += " WHERE project_id = ? && system_id = ?";
      queryParams.push(screen_project_system_Filter);
    }

    query += " GROUP BY Screens.id";

    connection.query(query, queryParams, async (err, results, fields) => {
      if (err) {
        console.log(err);
        return res.status(400).send();
      }
      const screensWithTasks = await Promise.all(
        results.map(async (screen) => {
          // Update screen data in the database
          await updateScreen(screen);
          // Format screen_plan_start and screen_plan_end to remove time
          screen.screen_plan_start = screen.screen_plan_start.toISOString().split('T')[0];
          screen.screen_plan_end = screen.screen_plan_end.toISOString().split('T')[0];
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


// Function to update screen data in the database
async function updateScreen(screen) {
  try {
    const updateQuery = `
      UPDATE systems 
      SET 
        system_manday = ?,
        system_progress = ?,
        system_plan_start = ?, 
        system_plan_end = ?
      WHERE id = ?
    `;

    const queryParams = [
      screen.system_manday,
      screen.system_progress,
      screen.system_plan_start,
      screen.system_plan_end,
      screen.id
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


router.post("/createScreen", async (req, res) => {
  const {
    screen_id,
    screen_name,
    screen_status,
    screen_level,
    screen_pic,
    system_id,
    screen_progress,
    screen_plan_start,
    screen_plan_end,
    project_id // เพิ่ม project_id เข้ามา
  } = req.body;

  try {
    const query =
      'INSERT INTO screens (screen_id, screen_name, screen_status, screen_level, screen_pic, system_id, screen_progress, screen_plan_start, screen_plan_end, project_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; // เพิ่ม project_id ใน query

    await new Promise((resolve, reject) => {
      connection.query(
        query,
        [
          screen_id,
          screen_name,
          screen_status,
          screen_level,
          screen_pic,
          system_id,
          screen_progress,
          screen_plan_start,
          screen_plan_end,
          project_id // เพิ่ม project_id ใน array ของ values
        ],
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      );
    });

    res.sendStatus(200);
  } catch (error) {
    console.error('Error creating screen:', error);
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
    system_id,
    screen_pic,
    project_id
  } = req.body;

  const updatedScreen = {
    screen_id,
    screen_name,
    screen_status,
    screen_level,
    system_id,
    screen_pic,
    project_id
  };

  try {
    connection.query(
      `UPDATE screens SET ? WHERE id = ?`,
      [updatedScreen, id],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          return res.status(400).send();
        }
        res.status(200).json({ message: "Screen updated successfully!" });
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});


//* DELETE screen+image by ID
router.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;

  try {
    // Check if the screen exists
    const selectSql = `SELECT * FROM screens WHERE id = ?`;
    const [screen] = await connection.query(selectSql, [id]);

    if (screen.length === 0) {
      return res.status(404).json({ message: "No screen with that id!" });
    }

    // Delete the screen and related tasks
    const deleteScreenSql = `DELETE FROM screens WHERE id = ?`;
    const deleteTasksSql = `DELETE FROM tasks WHERE screen_id = ?`;

    await connection.query(deleteScreenSql, [id]);
    await connection.query(deleteTasksSql, [screen[0].screen_id]);

    return res.status(200).json({ message: "Screen and related tasks deleted successfully!" });
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
});


router.post("/addUserScreen", async (req, res) => {
  const { user_id, screen_ids } = req.body;
  try {
    const createUserScreens = (user_id, screen_ids) => {
      // Check that screen_ids is an array
      if (!Array.isArray(screen_ids)) {
        console.log("Error: screen_ids is not an array");
        return;
      }

      // http://localhost:7777/systems/addUserScreen
      //   {
      //     "user_id": 15,
      //     "screen_ids": [1]
      //  }

      // Map over the screen IDs and insert a new row into the user_screens table for each one
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
