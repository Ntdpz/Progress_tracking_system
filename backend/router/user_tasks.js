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

module.exports = router;
