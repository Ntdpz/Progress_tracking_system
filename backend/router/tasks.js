const express = require('express');
const router = express.Router();
const connection = require("../db");
const moment = require('moment');

// Function to generate a random ID
function generateId() {
    const maxId = 999999999;
    const minId = 100000000;
    const id = Math.floor(Math.random() * (maxId - minId + 1)) + minId;
    return id;
}

// Middleware for database connection
router.use(async (req, res, next) => {
    try {
        // Implement your database connection logic here if needed
        next();
    } catch (error) {
        console.error('Error connecting to the database:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route for creating tasks
router.post('/createTasks', async (req, res) => {
    try {
        const {
            task_id,
            task_name,
            task_detail,
            task_manday,
            task_status,
            screen_id,
            project_id,
            system_id,
            task_plan_start,
            task_plan_end,
        } = req.body;

        const id = generateId(); // Using generateId() function to generate ID

        const query =
            'INSERT INTO Tasks (id, task_id, task_name, task_detail, task_status, screen_id, project_id, system_id, task_plan_start, task_plan_end) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

        await new Promise((resolve, reject) => {
            connection.query(
                query,
                [
                    id,
                    task_id,
                    task_name,
                    task_detail,
                    task_manday,
                    task_status,
                    screen_id,
                    project_id,
                    system_id,
                    task_plan_start,
                    task_plan_end,
                ],
                (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                }
            );
        });

        res.send('Task created successfully');
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route for getting all tasks
router.get('/getAll', async (req, res) => {
    try {
        const query = 'SELECT * FROM Tasks WHERE is_deleted = 0'; // Adding condition in WHERE to filter only non-deleted data

        const results = await new Promise((resolve, reject) => {
            connection.query(query, async (err, tasks) => {
                if (err) reject(err);
                const formattedTasks = await Promise.all(tasks.map(async (task) => {
                    const task_manday = moment.duration(moment(task.task_plan_end).diff(moment(task.task_plan_start))).asDays();
                    if (task.task_manday !== task_manday) {
                        // Update task_manday in the database
                        await updateTaskManday(task.id, task_manday);
                        // Update task object with new task_manday
                        return {
                            ...task,
                            task_manday: task_manday
                        };
                    } else {
                        return task;
                    }
                }));
                resolve(formattedTasks);
            });
        });

        res.json(formatDates(results));
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route for getting a single task by ID
router.get('/getOne/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const query = 'SELECT * FROM Tasks WHERE id = ? AND is_deleted = 0'; // Adding condition is_deleted = 0

        const task = await new Promise((resolve, reject) => {
            connection.query(query, [id], async (err, results) => {
                if (err) reject(err);
                if (results.length === 0) {
                    res.status(404).json({ error: 'Task not found' });
                } else {
                    const formattedTask = {
                        ...results[0],
                        task_plan_start: moment(results[0].task_plan_start).format('YYYY-MM-DD'),
                        task_plan_end: moment(results[0].task_plan_end).format('YYYY-MM-DD[Z]'),
                        task_actual_start: moment(results[0].task_actual_start).format('YYYY-MM-DD'),
                        task_actual_end: moment(results[0].task_actual_end).format('YYYY-MM-DD'),
                        is_deleted: 0 // Adding is_deleted to the returned data
                    };
                    resolve(formattedTask);
                }
            });
        });

        res.json(formatDates([task]));
    } catch (error) {
        console.error('Error fetching task by ID:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route for getting all deleted tasks
router.get('/getAllHistoryTasks', async (req, res) => {
    try {
        const query = 'SELECT * FROM Tasks WHERE is_deleted = 1'; // Selecting deleted Tasks

        const deletedTasks = await new Promise((resolve, reject) => {
            connection.query(query, (err, tasks) => {
                if (err) reject(err);
                resolve(tasks);
            });
        });

        res.json(deletedTasks);
    } catch (error) {
        console.error('Error fetching deleted tasks:', error);
        res.status(500).send('Internal Server Error');
    }
});
// GET Tasks by Project ID
router.get('/searchByProjectId/:project_id', async (req, res) => {
    try {
        const { project_id } = req.params;

        // สร้าง query SQL เพื่อดึงข้อมูล Tasks ตาม ID โครงการที่ระบุ
        let query = `
            SELECT * 
            FROM Tasks 
            WHERE project_id = ? AND is_deleted = 0
        `;

        // ดำเนินการคิวรีด้วย project_id ที่ให้ไว้
        connection.query(query, [project_id], async (err, results, fields) => {
            if (err) {
                console.error('Error fetching tasks by project ID:', err);
                return res.status(500).send('Internal Server Error');
            }

            // ตรวจสอบว่ามีข้อมูล tasks ที่สอดคล้องกับ project ID ที่ระบุหรือไม่
            if (results.length === 0) {
                return res.status(404).json({ message: 'No tasks found for this project ID' });
            }

            // ส่งข้อมูล tasks กลับในรูปแบบ JSON
            res.status(200).json(results);
        });
    } catch (error) {
        console.error('Error fetching tasks by project ID:', error);
        res.status(500).send('Internal Server Error');
    }
});
router.get('/searchByProjectId_delete/:project_id', async (req, res) => {
    try {
        const { project_id } = req.params;

        // สร้าง query SQL เพื่อดึงข้อมูลTasks ที่ถูกลบตาม ID โครงการที่ระบุ
        const query = `
            SELECT * 
            FROM Tasks 
            WHERE project_id = ? AND is_deleted = 1
        `;

        // ดำเนินการคิวรีด้วยพารามิเตอร์ project_id ที่ให้ไว้
        connection.query(query, [project_id], async (err, tasks, fields) => {
            if (err) {
                console.error('Error fetching deleted tasks by project ID:', err);
                return res.status(500).send('Internal Server Error');
            }

            // ส่งข้อมูลTasks ที่ถูกลบที่ตรวจสอบแล้วกลับในรูปแบบ JSON
            res.json(tasks);
        });
    } catch (error) {
        console.error('Error fetching deleted tasks by project ID:', error);
        res.status(500).send('Internal Server Error');
    }
});
router.get('/searchBySystemId/:system_id', async (req, res) => {
    try {
        const { system_id } = req.params;

        // สร้าง query SQL เพื่อดึงข้อมูล Tasks ตาม ID ระบบที่ระบุ พร้อมกรองข้อมูล Tasks ที่ถูกลบ
        const query = 'SELECT * FROM Tasks WHERE system_id = ? AND is_deleted = 0';

        const tasks = await new Promise((resolve, reject) => {
            connection.query(query, [system_id], async (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });

        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks by System ID:', error);
        res.status(500).send('Internal Server Error');
    }
});
router.get('/searchBySystemId_delete/:system_id', async (req, res) => {
    try {
        const { system_id } = req.params;

        const query = 'SELECT * FROM Tasks WHERE system_id = ? AND is_deleted = 1';

        connection.query(query, [system_id], (err, results) => {
            if (err) {
                console.error('Error fetching deleted tasks by system ID:', err);
                return res.status(500).send('Internal Server Error');
            }

            res.json(results);
        });
    } catch (error) {
        console.error('Error fetching deleted tasks by system ID:', error);
        res.status(500).send('Internal Server Error');
    }
});
// GET Screens by Screen id
router.get('/searchByScreenId/:screen_id', async (req, res) => {
    try {
        const { screen_id } = req.params;

        const query = `
            SELECT * FROM Tasks
            WHERE screen_id = ? AND is_deleted = 0
        `;

        connection.query(query, [screen_id], (err, tasks) => {
            if (err) {
                console.error('Error fetching tasks:', err);
                res.status(500).send('Internal Server Error');
                return;
            }

            res.json(tasks);
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).send('Internal Server Error');
    }
});
// GET Deleted Tasks by Screen id
router.get('/searchByScreenId_delete/:screen_id', async (req, res) => {
    try {
        const { screen_id } = req.params;

        // สร้าง query SQL เพื่อดึงข้อมูล Tasks ที่ถูกลบตาม Screen ID ที่ระบุ
        const query = 'SELECT * FROM Tasks WHERE screen_id = ? AND is_deleted = 1';

        connection.query(query, [screen_id], (err, results) => {
            if (err) {
                console.error('Error fetching deleted tasks by screen id:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            res.json(results);
        });
    } catch (error) {
        console.error('Error fetching deleted tasks by screen id:', error);
        res.status(500).send('Internal Server Error');
    }
});

async function updateTaskManday(taskId, taskManday) {
    const updateQuery = 'UPDATE Tasks SET task_manday = ? WHERE id = ?';
    connection.query(updateQuery, [taskManday, taskId], (err, result) => {
        if (err) {
            console.error('Error updating task manday:', err);
            throw err;
        }
        console.log('Task manday updated successfully:', result);
    });
}


// Function to format dates
function formatDates(tasks) {
    return tasks.map(task => ({
        ...task,
        task_plan_start: moment(task.task_plan_start).format('YYYY-MM-DD'),
        task_plan_end: moment(task.task_plan_end).format('YYYY-MM-DD'),
        task_actual_start: moment(task.task_actual_start).format('YYYY-MM-DD'),
        task_actual_end: moment(task.task_actual_end).format('YYYY-MM-DD')
    }));
}

// Function to update task_manday
async function updateTaskManday(taskId, taskManday) {
    const updateQuery = 'UPDATE Tasks SET task_manday = ? WHERE id = ?';
    connection.query(updateQuery, [taskManday, taskId], (err, result) => {
        if (err) {
            console.error('Error updating task manday:', err);
            throw err;
        }
        console.log('Task manday updated successfully:', result);
    });
}

// Route for updating task data
router.put('/updateTasks/:id', async (req, res) => {
    try {
        const {
            task_name,
            task_status,
            task_detail,
            task_progress,
            task_plan_start,
            task_plan_end,
            task_actual_start,
            task_actual_end,
        } = req.body;

        const { id } = req.params;

        const updatedTaskFields = {};

        // Check and add task_name if provided
        if (task_name !== undefined) {
            updatedTaskFields.task_name = task_name;
        }

        // Check and add task_status if provided
        if (task_status !== undefined) {
            updatedTaskFields.task_status = task_status;
        }

        // Check and add task_detail if provided
        if (task_detail !== undefined) {
            updatedTaskFields.task_detail = task_detail;
        }

        // Check and add task_progress if provided
        if (task_progress !== undefined) {
            updatedTaskFields.task_progress = task_progress;
        }

        // Check and add task_plan_start if provided
        if (task_plan_start !== undefined) {
            updatedTaskFields.task_plan_start = task_plan_start;
        }

        // Check and add task_plan_end if provided
        if (task_plan_end !== undefined) {
            updatedTaskFields.task_plan_end = task_plan_end;
        }

        // Check and add task_actual_start if provided
        if (task_actual_start !== undefined) {
            updatedTaskFields.task_actual_start = task_actual_start;
        }

        // Check and add task_actual_end if provided
        if (task_actual_end !== undefined) {
            updatedTaskFields.task_actual_end = task_actual_end;
        }

        if (Object.keys(updatedTaskFields).length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        const query = 'UPDATE Tasks SET ? WHERE id = ?';

        await new Promise((resolve, reject) => {
            connection.query(query, [updatedTaskFields, id], (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });

        res.send('Task updated successfully');
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route for deleting a task
router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const query = 'UPDATE Tasks SET is_deleted = true WHERE id = ?';

        await new Promise((resolve, reject) => {
            connection.query(query, [id], (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });

        res.send('Task deleted successfully');
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route for deleting a task and related data
router.delete('/deleteHistoryTasks/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Delete tasks related to the task
        const deleteTasksQuery = 'DELETE FROM Tasks WHERE id = ?';
        await new Promise((resolve, reject) => {
            connection.query(deleteTasksQuery, [id], (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });

        // Delete the task itself
        const deleteTaskQuery = 'UPDATE Tasks SET is_deleted = true WHERE id = ?';
        await new Promise((resolve, reject) => {
            connection.query(deleteTaskQuery, [id], (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });

        res.send('Task and related data deleted successfully');
    } catch (error) {
        console.error('Error deleting task and related data:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Exporting the router
module.exports = router;