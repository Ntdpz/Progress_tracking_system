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
        connection.query("SELECT * FROM user_projects", (err, results, fields) => {
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
            "SELECT * FROM user_projects WHERE user_id = ?",
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

//* GET one by project_id
router.get("/getOneScreenID/:project_id", async (req, res) => {
    const project_id = req.params.project_id;
    try {
        connection.query(
            "SELECT users.id, users.user_firstname,users.user_position FROM user_projects INNER JOIN users ON user_projects.user_id = users.id INNER JOIN projects ON user_projects.project_id = projects.id WHERE user_projects.project_id = ?",
            [project_id],
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

// * POST FROM user_projects
router.post("/createUser_project", async (req, res) => {
    const { user_id, project_id } = req.body;
    try {
        for (let i = 0; i < user_id.length; i++) {
            // Check if the combination of user_id and project_id already exists in the database
            connection.query(
                "SELECT * FROM user_projects WHERE user_id = ? AND project_id = ?",
                [user_id[i], project_id],
                (err, results, fields) => {
                    if (err) {
                        console.log("Error while checking for duplicate user_projects in the database", err);
                        return;
                    }
                    if (results.length > 0) {
                        console.log("Duplicate user_projects found in the database");
                        return;
                    } else {
                        // Insert new record into user_projects table
                        connection.query(
                            "INSERT INTO user_projects(user_id, project_id) VALUES(?, ?)",
                            [user_id[i], project_id],
                            (err, results, fields) => {
                                if (err) {
                                    console.log("Error while inserting a user_project into the database", err);
                                    return;
                                }
                            }
                        );
                    }
                }
            );
        }
        return res
            .status(201)
            .json({ message: "New user_projects successfully created!" });
    } catch (err) {
        console.log("Error while inserting user_project(s) into the database", err);
        return res.status(400).send();
    }
});

//* DELETE user by user_id
router.delete("/deleteUserID/:user_id", async (req, res) => {
    const user_id = req.params.user_id;

    try {
        connection.query(
            "DELETE FROM user_projects WHERE user_id = ?",
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
router.delete("/deleteUserProjectById/:project_id/:user_id", async (req, res) => {
    const { project_id, user_id } = req.params;
    try {
        connection.query(
            "DELETE FROM user_projects WHERE project_id = ? AND user_id = ?",
            [project_id, user_id],
            (err, results, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                if (results.affectedRows === 0) {
                    return res.status(404).json({ message: "No matching record found" });
                }
                return res.status(200).json({ message: "Record deleted successfully!" });
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
            "DELETE FROM user_projects WHERE project_id = ?",
            [project_id],
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

router.get("/getUserProjectsByProjectId/:project_id", async (req, res) => {
    const project_id = req.params.project_id;
    try {
        connection.query(
            "SELECT up.user_id, u.id, u.user_firstname, u.user_lastname, u.user_position, u.user_department, u.user_pic FROM user_projects up INNER JOIN users u ON up.user_id = u.id WHERE up.project_id = ?",
            [project_id],
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
router.get("/getUsersNotInProject/:project_id", async (req, res) => {
    const project_id = req.params.project_id;
    try {
        connection.query(
            `SELECT users.id, users.user_firstname, users.user_lastname, users.user_position 
            FROM users 
            LEFT JOIN user_projects ON users.id = user_projects.user_id AND user_projects.project_id = ? 
            WHERE user_projects.project_id IS NULL`,
            [project_id],
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




module.exports = router;