const express = require("express");
const router = express.Router();
const connection = require("../db"); // เชื่อมต่อฐานข้อมูล

// API เพื่อดึงข้อมูลงานทั้งหมดของ task_member_id ที่กำหนด
router.get("/GetTasksBytask_member_id/:task_member_id", (req, res) => {
    const { task_member_id } = req.params;

    // สร้าง query สำหรับดึงข้อมูลจากตาราง tasks
    const query = `
        SELECT id, task_id, task_name, task_detail, task_status, task_manday, task_actual_manday,
               screen_id, project_id, task_type, system_id, task_progress, task_plan_start, 
               task_plan_end, task_actual_start, task_actual_end, task_member_id, 
               task_date_update, is_archived, task_member_create
        FROM tasks
        WHERE task_member_id = ?`;

    // ดึงข้อมูลจากฐานข้อมูล
    connection.query(query, [task_member_id], (error, results) => {
        if (error) {
            console.error("Error fetching tasks:", error);
            return res.status(500).json({ message: "Error fetching tasks", error });
        }

        res.status(200).json({ tasks: results });
    });
});

// API เพื่อดึงข้อมูลชื่อผู้ใช้และนับจำนวน tasks ตามสถานะ
router.get("/GetAll", (req, res) => {
    // สร้าง query สำหรับดึงข้อมูล user และนับจำนวน tasks ตามสถานะ
    const query = `
        SELECT u.id AS user_id, 
               u.user_firstname, 
               u.user_lastname, 
               u.user_position,
               u.user_department,
               u.user_pic,
               COUNT(t.id) AS task_count,
               SUM(CASE 
                   WHEN CURDATE() BETWEEN t.task_plan_start AND t.task_plan_end 
                        AND t.task_progress != 100 THEN 1 
                   ELSE 0 
               END) AS task_count_inprogress,
               SUM(CASE 
                   WHEN CURDATE() > t.task_plan_end 
                        AND t.task_progress != 100 THEN 1 
                   ELSE 0 
               END) AS task_count_late,
               SUM(CASE 
                   WHEN t.task_progress = 100 THEN 1 
                   ELSE 0 
               END) AS task_count_complete
        FROM users u
        LEFT JOIN tasks t ON u.id = t.task_member_id
        GROUP BY u.id`;

    // ดึงข้อมูลจากฐานข้อมูล
    connection.query(query, (error, results) => {
        if (error) {
            console.error("Error fetching task members:", error);
            return res.status(500).json({ message: "Error fetching task members", error });
        }

        res.status(200).json({ task_members: results });
    });
});


module.exports = router;
