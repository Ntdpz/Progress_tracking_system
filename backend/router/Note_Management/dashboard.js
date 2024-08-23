const express = require("express");
const router = express.Router();
const connection = require("../../db");

// ฟังก์ชันสำหรับ API GET
router.get('/user-screens/:id', (req, res) => {
    const userId = req.params.id;

    // คิวรีข้อมูลจากตาราง user_screens และนำ screen_id ไปค้นหาในตาราง screens โดยเลือกเฉพาะ screen_status = "Test"
    const query = `
    SELECT s.*
    FROM user_screens us
    JOIN screens s ON us.screen_id = s.id
    WHERE us.user_id = ? AND s.screen_phase = 'TEST'
  `;

    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        // ส่งผลลัพธ์เป็น JSON
        res.json(results);
    });
});

module.exports = router;