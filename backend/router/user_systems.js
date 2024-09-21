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
        connection.query("SELECT * FROM user_systems", (err, results, fields) => {
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
            "SELECT * FROM user_systems WHERE user_id = ?",
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

//* GET one by system_id
router.get("/getAllSystemId/:system_id", async (req, res) => {
    const system_id = req.params.system_id;
    try {
        connection.query(
            "SELECT users.id, users.user_firstname, users.user_lastname, users.user_position, users.user_pic FROM user_systems INNER JOIN users ON user_systems.user_id = users.id INNER JOIN systems ON user_systems.system_id = systems.id WHERE user_systems.system_id = ?",
            [system_id],
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

// * POST to create user_systems
router.post('/createUser_system', async (req, res) => {
    const { user_ids, project_id, system_id } = req.body;

    // ตรวจสอบว่ามีข้อมูล user_ids หรือไม่
    if (!user_ids || user_ids.length === 0) {
        return res.status(400).json({ message: "No users selected" });
    }

    try {
        // ลูปผ่าน user_ids แล้วบันทึกลงในตาราง user_systems
        for (let user_id of user_ids) {
            const query = `
                INSERT INTO user_systems (id, user_id, project_id, system_id)
                VALUES (?, ?, ?, ?)
            `;

            const id = generateId(); // สร้าง ID ใหม่

            await new Promise((resolve, reject) => {
                connection.query(query, [id, user_id, project_id, system_id], (error, results) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(results);
                });
            });
        }

        res.status(200).json({ message: "Users assigned successfully" });
    } catch (error) {
        console.error('Error assigning users to system:', error);
        res.status(500).json({ message: "Error assigning users to system" });
    }
});


// * Put FROM user_system by user_id
router.put("/updateUserID/:user_id", async (req, res) => {
    const user_id = req.params.user_id;
    const {
        screen_id,
    } = req.body;
    try {
        connection.query(
            "UPDATE user_systems SET system_id = ? WHERE user_id = ?",
            [
                system_id,
                user_id,
            ],
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


//* DELETE user by user_id
router.delete("/deleteUserID/:user_id", async (req, res) => {
    const user_id = req.params.user_id;

    try {
        connection.query(
            "DELETE FROM user_systems WHERE user_id = ?",
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

//* DELETE user by system_id
router.delete("/deleteScreenID/:system_id", async (req, res) => {
    const system_id = req.params.system_id;

    try {
        connection.query(
            "DELETE FROM user_systems WHERE system_id = ?",
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
                    .json({ message: "system_id deleted successfully!" });
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
            "DELETE FROM user_systems WHERE project_id = ?",
            [project_id],
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
                    .json({ message: "project_id deleted successfully!" });
            }
        );
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});


//* GET user by system_id and project_id
router.get("/getUserBySystemAndProject/:system_id/:project_id", async (req, res) => {
    const { system_id, project_id } = req.params;
    try {
        connection.query(
            "SELECT users.id, users.user_firstname, users.user_lastname, users.user_position, users.user_department, users.user_pic FROM user_systems INNER JOIN users ON user_systems.user_id = users.id WHERE user_systems.system_id = ? AND user_systems.project_id = ?",
            [system_id, project_id],
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

// Get users not in system by system_id and project_id
router.get("/checkUsersNotInSystem/:system_id/:project_id", async (req, res) => {
    const { project_id, system_id } = req.params;

    try {
        // Query to find users who are in the project but not in the system
        const query = `
            SELECT u.id, u.user_firstname, u.user_lastname, u.user_position,u.user_pic,u.user_department
            FROM users u
            JOIN user_projects up ON u.id = up.user_id
            LEFT JOIN user_systems us ON u.id = us.user_id AND us.system_id = ? AND us.project_id = ?
            WHERE up.project_id = ?
            AND us.user_id IS NULL
        `;

        // ใช้ project_id และ system_id ในการค้นหาข้อมูล
        connection.query(query, [system_id, project_id, project_id], (err, results, fields) => {
            if (err) {
                console.log(err);
                return res.status(400).send();
            }
            // ส่งรายชื่อผู้ใช้ที่ไม่ได้อยู่ในระบบกลับไป
            res.status(200).json(results);
        });
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});




//* DELETE user_system by system_id, project_id, and user_id
router.delete("/deleteUserSystem/:system_id/:project_id/:user_id", async (req, res) => {
    const { system_id, project_id, user_id } = req.params;

    try {
        connection.query(
            "DELETE FROM user_systems WHERE system_id = ? AND project_id = ? AND user_id = ?",
            [system_id, project_id, user_id],
            (err, results, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                if (results.affectedRows === 0) {
                    return res.status(404).json({ message: "No matching user_system found" });
                }
                return res.status(200).json({ message: "User system deleted successfully" });
            }
        );
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});

// GET systems by user_id and project_id
router.get("/getSystemsByUser_id/:project_id/:user_id", async (req, res) => {
    const { project_id, user_id } = req.params;

    try {
        connection.query(
            "SELECT systems.* FROM user_systems INNER JOIN systems ON user_systems.system_id = systems.id WHERE user_systems.project_id = ? AND user_systems.user_id = ?",
            [project_id, user_id],
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


// GET API: รับข้อมูล user_systems จาก system_id
router.get('/getUserSystemsBySystemId/:system_id', (req, res) => {
    const systemId = req.params.system_id;

    const sqlQuery = `
    SELECT u.id, u.user_firstname, u.user_lastname, u.user_position, u.user_department, u.user_email, u.user_status, u.user_role, u.user_pic
    FROM user_systems us
    JOIN users u ON us.user_id = u.id
    WHERE us.system_id = ?
  `;

    connection.query(sqlQuery, [systemId], (err, results) => {
        if (err) {
            console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', err);
            res.status(500).send('เกิดข้อผิดพลาดในการดึงข้อมูล');
        } else {
            res.json(results);
        }
    });
});

module.exports = router;