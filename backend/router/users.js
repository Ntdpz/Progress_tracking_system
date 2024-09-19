const express = require("express"); // เรียกใช้งาน Express.js
const router = express.Router(); // สร้าง Router ของ Express.js
const connection = require("../db"); // Import object ที่เชื่อมต่อกับฐานข้อมูล
const multer = require("multer"); // เรียกใช้งาน multer สำหรับการอัปโหลดไฟล์
const fs = require("fs"); // เรียกใช้งาน fs เพื่อจัดการไฟล์ระบบไฟล์
const path = require("path"); // เรียกใช้งาน path เพื่อจัดการเส้นทางไฟล์
const uuid = require("uuid"); // เรียกใช้งาน uuid เพื่อสร้าง UUID

const storage = multer.diskStorage({ // กำหนดการจัดเก็บไฟล์ที่อัปโหลดด้วย multer
  destination(req, file, cb) {
    cb(null, "../frontend/static/uploads/"); // กำหนดตำแหน่งที่จะบันทึกไฟล์
  },
  filename(req, file, cb) {
    const originalname = file.originalname; // รับชื่อไฟล์เดิม
    const filename =
      uuid.v4() + // สร้าง UUID เพื่อป้องกันชื่อไฟล์ซ้ำ
      "-" +
      Date.now() +
      "-" +
      originalname.substring(originalname.lastIndexOf("/") + 1); // สร้างชื่อไฟล์ใหม่
    cb(null, filename); // ส่งชื่อไฟล์ใหม่กลับ
  },
});

const upload = multer({ storage }); // กำหนดการอัปโหลดไฟล์ด้วย multer
const defaultName = "../frontend/static/uploads/DefaultAvatar.jpg"; // กำหนดเส้นทางไฟล์ภาพโปรไฟล์เริ่มต้น
const defaultImage = defaultName.substring(defaultName.lastIndexOf("/") + 1); // ดึงชื่อไฟล์ภาพโปรไฟล์เริ่มต้น

function generateId() { // ฟังก์ชันสำหรับสร้าง ID แบบสุ่ม
  const maxId = 999999999;
  const minId = 100000000;
  const id = Math.floor(Math.random() * (maxId - minId + 1)) + minId;
  return id;
}
// * post user + image
// * post user + image
router.post("/createUser", (req, res) => {
  const data = req.body; // รับข้อมูลจาก body ของ request
  const id = generateId(); // สร้าง ID โดยใช้ฟังก์ชัน generateId()

  // เพิ่ม ID เข้าไปใน object data ที่จะถูกส่งไปยังฐานข้อมูล
  const userData = {
    id: id, // ใส่ค่า ID ที่สร้างลงไป
    ...data, // ข้อมูลอื่นๆ ที่มาจาก req.body
  };

  const sql = `INSERT INTO users SET ?`; // สร้างคำสั่ง SQL สำหรับการเพิ่มข้อมูลในตาราง users
  connection.query(
    sql, userData, // ส่งคำสั่ง SQL และข้อมูลที่ต้องการเพิ่มไปยังฐานข้อมูล
    (err, result) => { // รับผลลัพธ์จากการส่งคำสั่ง SQL
      if (err) { // หากเกิดข้อผิดพลาด
        console.error(err); // แสดงข้อผิดพลาดใน console
        res.sendStatus(500); // ส่งรหัสสถานะ 500 (Internal Server Error) กลับไปยัง client
      } else {
        console.log(`Inserted ${result.affectedRows} row(s)`); // แสดงข้อความบอกจำนวนแถวที่ถูกเพิ่มใน console
        res.sendStatus(200); // ส่งรหัสสถานะ 200 (OK) กลับไปยัง client
      }
    }
  );
});

// ฟังก์ชันสำหรับสร้าง ID แบบสุ่ม
function generateId() {
  const maxId = 999999999;
  const minId = 100000000;
  const id = Math.floor(Math.random() * (maxId - minId + 1)) + minId;
  return id;
}

router.put("/updateUsers/:id", (req, res) => { // อัปเดตข้อมูลผู้ใช้
  const id = req.params.id; // รับค่า ID จากพารามิเตอร์ใน URL
  const data = req.body; // รับข้อมูลที่ต้องการอัปเดตจาก body ของ request

  try {
    let sql;
    let values;
    sql = `UPDATE users SET ? WHERE id = ?`; // สร้างคำสั่ง SQL สำหรับการอัปเดตข้อมูลในตาราง users
    values = [
      data, id,
    ];
    connection.query(sql, values, (err, results, fields) => { // ส่งคำสั่ง SQL ไปยังฐานข้อมูลและรับผลลัพธ์
      if (err) { // หากเกิดข้อผิดพลาด
        console.log(err); // แสดงข้อผิดพลาดใน console
        return res.status(400).send(err); // ส่งรหัสสถานะ 400 (Bad Request) พร้อมกับข้อความข้อผิดพลาดกลับไปยัง client
      }
      res.status(200).json({ message: "User updated successfully!" }); // ส่งข้อความแสดงว่าอัปเดตผู้ใช้เรียบร้อยแล้วกลับไปยัง client พร้อมกำหนดสถานะการตอบกลับเป็น 200 (OK)
    });
  } catch (err) { // หากเกิดข้อผิดพลาดระหว่างการประมวลผล
    console.log(err); // แสดงข้อผิดพลาดใน console
    return res.status(500).send(err); // ส่งรหัสสถานะ 500 (Internal Server Error) พร้อมกับข้อความข้อผิดพลาดกลับไปยัง client
  }
});
router.get("/getUserByPosition", async (req, res) => { // ค้นหาผู้ใช้ตามตำแหน่ง
  try {
    const positionFilter = req.query.user_position; // รับค่าจากพารามิเตอร์ user_position
    let query = "SELECT * FROM users WHERE user_position = ?"; // สร้างคำสั่ง SQL สำหรับการค้นหาผู้ใช้ตามตำแหน่ง
    connection.query(query, [positionFilter], (err, results, fields) => { // ส่งคำสั่ง SQL ไปยังฐานข้อมูลและรับผลลัพธ์
      if (err) { // หากเกิดข้อผิดพลาดในการค้นหาข้อมูล
        console.log(err);
        return res.status(400).send(); // ส่งรหัสสถานะ 400 (Bad Request) กลับไปยัง client
      }
      res.status(200).json(results); // ส่งผลลัพธ์กลับไปยัง client พร้อมกำหนดสถานะการตอบกลับเป็น 200 (OK)
    });
  } catch (err) { // หากเกิดข้อผิดพลาดระหว่างการประมวลผล
    console.log(err);
    return res.status(500).send(); // ส่งรหัสสถานะ 500 (Internal Server Error) กลับไปยัง client
  }
});

router.get("/getAll", async (req, res) => { // รับข้อมูลทั้งหมด
  try {
    const positionFilter = req.query.user_position; // รับค่าจากพารามิเตอร์ user_position
    const idFilter = req.query.user_id; // รับค่าจากพารามิเตอร์ user_id
    let query = "SELECT * FROM users"; // สร้างคำสั่ง SQL สำหรับการเลือกข้อมูลทั้งหมดจากตาราง users
    const queryParams = [];
    if (positionFilter) { // ถ้ามีการกรองตามตำแหน่งผู้ใช้
      query += " WHERE user_position = ?"; // เพิ่มเงื่อนไข WHERE เข้าไปในคำสั่ง SQL
      queryParams.push(positionFilter); // เพิ่มค่าตัวแปร positionFilter เข้าไปใน queryParams
    } else if (idFilter) { // ถ้ามีการกรองตาม ID ผู้ใช้
      query += " WHERE user_id = ?"; // เพิ่มเงื่อนไข WHERE เข้าไปในคำสั่ง SQL
      queryParams.push(idFilter); // เพิ่มค่าตัวแปร idFilter เข้าไปใน queryParams
    }
    connection.query(query, queryParams, (err, results, fields) => { // ส่งคำสั่ง SQL ไปยังฐานข้อมูลและรับผลลัพธ์
      if (err) { // หากเกิดข้อผิดพลาดในการดึงข้อมูล
        console.log(err);
        return res.status(400).send(); // ส่งรหัสสถานะ 400 (Bad Request) กลับไปยัง client
      }
      res.status(200).json(results); // ส่งผลลัพธ์กลับไปยัง client พร้อมกำหนดสถานะการตอบกลับเป็น 200 (OK)
    });
  } catch (err) { // หากเกิดข้อผิดพลาดระหว่างการประมวลผล
    console.log(err);
    return res.status(500).send(); // ส่งรหัสสถานะ 500 (Internal Server Error) กลับไปยัง client
  }
});
router.get("/getOne/:id", async (req, res) => { // เรียกดูข้อมูลผู้ใช้จาก ID
  const id = req.params.id; // รับค่า ID จากพารามิเตอร์ใน URL
  try {
    connection.query(
      "SELECT * FROM users WHERE id = ?", // สร้างคำสั่ง SQL สำหรับการดึงข้อมูลผู้ใช้จาก ID
      [id], // ส่งค่า ID เพื่อใส่ในส่วนของคำสั่ง SQL
      (err, results, fields) => { // ส่งคำสั่ง SQL ไปยังฐานข้อมูลและรับผลลัพธ์
        if (err) { // หากเกิดข้อผิดพลาดในการดึงข้อมูล
          console.log(err);
          return res.status(400).send(); // ส่งรหัสสถานะ 400 (Bad Request) กลับไปยัง client
        }
        res.status(200).json(results); // ส่งผลลัพธ์กลับไปยัง client พร้อมกำหนดสถานะการตอบกลับเป็น 200 (OK)
      }
    );
  } catch (err) { // หากเกิดข้อผิดพลาดระหว่างการประมวลผล
    console.log(err);
    return res.status(500).send(); // ส่งรหัสสถานะ 500 (Internal Server Error) กลับไปยัง client
  }
});
router.delete("/deleteUser/:id", (req, res) => { // ลบข้อมูลผู้ใช้โดยใช้ ID
  const id = req.params.id; // รับค่า ID จากพารามิเตอร์ใน URL

  const deleteUserSql = `DELETE FROM users WHERE id = ${id}`; // สร้างคำสั่ง SQL สำหรับการลบข้อมูลผู้ใช้

  connection.query(deleteUserSql, (error, results, fields) => { // ส่งคำสั่ง SQL ไปยังฐานข้อมูลและรับผลลัพธ์
    if (error) { // หากเกิดข้อผิดพลาดในการลบข้อมูล
      res.status(500).send(`Error deleting user database: ${error}`); // ส่งรหัสสถานะ 500 (Internal Server Error) พร้อมกับข้อความแสดงข้อผิดพลาดกลับไปยัง client
      return;
    }

    if (results.affectedRows === 0) { // หากไม่มีการอัปเดตข้อมูลในฐานข้อมูล
      return res.status(404).json({ message: "No user with that id!" }); // ส่งรหัสสถานะ 404 (Not Found) พร้อมกับข้อความแสดงว่าไม่พบผู้ใช้ด้วย ID นั้นในฐานข้อมูลกลับไปยัง client
    }

    res.status(200).json({ message: "user_id deleted successfully!" }); // ส่งข้อความแสดงว่าลบผู้ใช้สำเร็จแล้วกลับไปยัง client พร้อมกำหนดสถานะการตอบกลับเป็น 200 (OK)
    console.log(`Database entry with id ${id} deleted successfully.`);
  });
});

router.post("/login", async (req, res) => { // เข้าสู่ระบบ
  const { user_id, user_password } = req.body; // รับค่า user_id และ user_password จาก body ของ request

  try {
    connection.query(
      "SELECT * FROM users WHERE user_id = ? AND user_password = ?", // สร้างคำสั่ง SQL สำหรับการเลือกข้อมูลผู้ใช้ที่ตรงกับ user_id และ user_password
      [user_id, user_password], // ส่งค่า user_id และ user_password เพื่อใส่ในส่วนของคำสั่ง SQL
      (error, results, fields) => { // ส่งคำสั่ง SQL ไปยังฐานข้อมูลและรับผลลัพธ์
        if (error) { // หากเกิดข้อผิดพลาดในการค้นหาข้อมูล
          console.error(error);
          return res.status(500).json({ message: "Server error" }); // ส่งรหัสสถานะ 500 (Internal Server Error) พร้อมกับข้อความแสดงข้อผิดพลาดกลับไปยัง client
        }

        if (results.length > 0) { // หากมีผลลัพธ์การค้นหา
          req.session.authenticated = true; // กำหนด session ให้เป็น authenticated เมื่อเข้าสู่ระบบสำเร็จ
          return res.status(200).json({ authenticated: true }); // ส่งรหัสสถานะ 200 (OK) พร้อมกับข้อมูลแสดงว่าเข้าสู่ระบบสำเร็จกลับไปยัง client
        }

        return res.status(401).json({ message: "Invalid credentials" }); // ส่งรหัสสถานะ 401 (Unauthorized) พร้อมกับข้อความแสดงว่าข้อมูลเข้าสู่ระบบไม่ถูกต้องกลับไปยัง client
      }
    );
  } catch (error) { // หากเกิดข้อผิดพลาดระหว่างการประมวลผล
    console.error(error);
    return res.status(500).json({ message: "Server error" }); // ส่งรหัสสถานะ 500 (Internal Server Error) พร้อมกับข้อความแสดงข้อผิดพลาดกลับไปยัง client
  }
});
module.exports = router;