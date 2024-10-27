const express = require("express");
const router = express.Router();
const connection = require("../db");
const moment = require("moment");
const multer = require("multer");

// ตั้งค่า multer เพื่อจัดการการอัปโหลดไฟล์
const storage = multer.memoryStorage(); // ใช้หน่วยความจำเพื่อเก็บไฟล์ชั่วคราว
const upload = multer({ storage: storage });


// Function to generate a random ID
function generateId() {
    const maxId = 999999999;
    const minId = 100000000;
    const id = Math.floor(Math.random() * (maxId - minId + 1)) + minId;
    return id;
}

// API to get all task images
router.get("/getAll", (req, res) => {
    const query = "SELECT * FROM task_images "; // ดึงข้อมูลที่ไม่ได้ถูกลบ

    connection.query(query, (error, results) => {
        if (error) {
            console.error("Error retrieving task images:", error);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        // ส่งผลลัพธ์กลับไป
        res.status(200).json(results);
    });
});

router.post("/createTaskImages", (req, res) => {
    const { task_id, created_by, images } = req.body;

    if (!task_id || !created_by || !images || images.length === 0) {
        return res.status(400).json({ message: "Missing required fields or files." });
    }

    const queries = images.map(image => {
        const image_base64 = image.image_base64; // รับค่า base64 จาก JSON
        const image_name = image.image_name; // ชื่อไฟล์
        const image_type = image.image_type; // ประเภทของไฟล์
        const id = generateId(); // สร้าง ID ใหม่สำหรับแต่ละรูปภาพ

        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO task_images (id, task_id, image_base64, image_name, image_type, created_by)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            const values = [id, task_id, image_base64, image_name, image_type, created_by];
            connection.query(query, values, (error, results) => {
                if (error) {
                    return reject(error);
                }
                resolve(results);
            });
        });
    });

    Promise.all(queries)
        .then(() => res.status(201).json({ message: "Images uploaded successfully." }))
        .catch(error => {
            console.error("Error uploading images:", error);
            res.status(500).json({ message: "Internal Server Error" });
        });
});

// GET endpoint to retrieve images by task_id with user information
router.get("/searchByTaskid/:task_id", (req, res) => {
    const taskId = req.params.task_id;

    // SQL query to retrieve images and user information based on task_id
    const query = `
        SELECT 
            task_images.id,
            task_images.task_id,
            task_images.image_base64,
            task_images.image_name,
            task_images.image_type,
            CONCAT(users.user_firstname, ' ', users.user_lastname) AS created_by_name,
            task_images.upload_date
        FROM 
            task_images
        JOIN 
            users ON task_images.created_by = users.id
        WHERE 
            task_images.task_id = ?
    `;

    connection.query(query, [taskId], (error, results) => {
        if (error) {
            console.error("Error retrieving images:", error);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No images found for this task_id." });
        }

        // Return the retrieved images with user information
        res.status(200).json(results);
    });
});
// DELETE endpoint to remove an image by id
router.delete("/DeleteOne/:id", (req, res) => {
    const imageId = req.params.id;

    // SQL query to delete the image by id
    const query = `
        DELETE FROM task_images
        WHERE id = ?
    `;

    connection.query(query, [imageId], (error, results) => {
        if (error) {
            console.error("Error deleting image:", error);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        // Check if any rows were affected
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "No image found with this id." });
        }

        // Successfully deleted
        res.status(200).json({ message: "Image deleted successfully." });
    });
});


// Exporting the router
module.exports = router;
