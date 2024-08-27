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
            task_status,
            screen_id,
            project_id,
            system_id,
            task_plan_start,
            task_plan_end,
            task_member_id,
            task_manday // เพิ่มฟิลด์ task_manday เข้ามา
        } = req.body;

        const id = generateId(); // ใช้ generateId() function เพื่อสร้าง ID

        const query =
            'INSERT INTO tasks (id, task_id, task_name, task_detail, task_status, screen_id, project_id, system_id, task_plan_start, task_plan_end, task_member_id, task_manday) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; // เพิ่มฟิลด์ task_manday เข้าไปในคำสั่ง SQL

        await new Promise((resolve, reject) => {
            connection.query(
                query,
                [
                    id,
                    task_id,
                    task_name,
                    task_detail,
                    task_status,
                    screen_id,
                    project_id,
                    system_id,
                    task_plan_start,
                    task_plan_end,
                    task_member_id,
                    task_manday // เพิ่ม task_manday เข้าไปใน array ของ parameters
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
        const query = 'SELECT * FROM Tasks '; // Adding condition in WHERE to filter only non-deleted data

        const results = await new Promise((resolve, reject) => {
            connection.query(query, async (err, tasks) => {
                if (err) reject(err);
                const formattedTasks = await Promise.all(tasks.map(async (task) => {
                    const task_manday = moment.duration(moment(task.task_plan_end).diff(moment(task.task_plan_start))).asDays();
                    if (task.task_manday !== task_manday) {
                        // Update task_manday in the database
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

        const query = 'SELECT * FROM Tasks  ';

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


// GET Tasks by Project ID
router.get('/searchByProjectId/:project_id', async (req, res) => {
    try {
        const { project_id } = req.params;

        // สร้าง query SQL โดยทำการ JOIN ระหว่างตาราง Tasks, Projects, Systems, และ Screens
        let query = `
            SELECT 
                Tasks.task_id, 
                Tasks.task_name, 
                Tasks.task_detail, 
                Tasks.task_status, 
                Tasks.task_manday, 
                Tasks.task_progress, 
                Tasks.task_plan_start, 
                Tasks.task_plan_end, 
                Projects.project_name_ENG, 
                Systems.system_nameEN, 
                Screens.screen_name,
                Tasks.project_id,
                Tasks.system_id,
                Tasks.screen_id,
                Tasks.id,
                task_actual_start,
                task_actual_end

            FROM Tasks
            JOIN Projects ON Tasks.project_id = Projects.id
            JOIN Systems ON Tasks.system_id = Systems.id
            JOIN Screens ON Tasks.screen_id = Screens.id
            WHERE Tasks.project_id = ?
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


router.get('/searchBySystemId/:system_id', async (req, res) => {
    try {
        const { system_id } = req.params;

        // สร้าง query SQL เพื่อดึงข้อมูล Tasks ตาม ID ระบบที่ระบุ พร้อมกรองข้อมูล Tasks ที่ถูกลบ
        const query = 'SELECT * FROM Tasks WHERE system_id = ?';

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

// GET Screens by Screen id
router.get('/searchByScreenId/:screen_id', async (req, res) => {
    try {
        const { screen_id } = req.params;

        const query = `
            SELECT * FROM Tasks
            WHERE screen_id = ? 
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



// Route for updating task data
router.put('/updateTasks/:id', async (req, res) => {
    try {
        const {
            task_name,
            task_detail,
            task_status,
            task_manday,
            task_progress,
            task_plan_start,
            task_plan_end,
            task_actual_start,
            task_actual_end,
            task_member_id,
        } = req.body;

        const { id } = req.params;

        const updatedTaskFields = {};

        // Check and add task_name if provided
        if (task_name !== undefined) {
            updatedTaskFields.task_name = task_name;
        }

        // Check and add task_detail if provided
        if (task_detail !== undefined) {
            updatedTaskFields.task_detail = task_detail;
        }

        // Check and add task_status if provided
        if (task_status !== undefined) {
            updatedTaskFields.task_status = task_status;
        }

        // Check and add task_manday if provided
        if (task_manday !== undefined) {
            updatedTaskFields.task_manday = task_manday;
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

        // Check and add task_member_id if provided
        if (task_member_id !== undefined) {
            updatedTaskFields.task_member_id = task_member_id;
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

        res.send('Task and related data deleted successfully');
    } catch (error) {
        console.error('Error deleting task and related data:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route for saving history tasks and updating tasks
router.put('/save_history_tasks/:id', async (req, res) => {
    try {
        const taskId = req.params.id;

        // Get the current task data
        const [currentTask] = await connection.promise().query('SELECT * FROM tasks WHERE id = ?', [taskId]);

        if (currentTask.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Update task data
        const {
            task_name,
            task_detail,
            task_status,
            task_progress,
            task_plan_start,
            task_plan_end,
            task_actual_start,
            task_actual_end,
            user_update,
            task_manday,
            task_member_id // Add task_member_id here
        } = req.body;

        // Check if task_member_id is provided, if not, use the current task_member_id value
        const updatedTaskMemberId = task_member_id !== undefined ? task_member_id : currentTask[0].task_member_id;

        await connection.promise().query('UPDATE tasks SET task_name=?, task_detail=?, task_status=?, task_progress=?, task_plan_start=?, task_plan_end=?, task_actual_start=?, task_actual_end=?,user_update=?, task_manday=?, task_date_update=?, task_member_id=? WHERE id=?', [
            task_name,
            task_detail,
            task_status,
            task_progress,
            task_plan_start,
            task_plan_end,
            task_actual_start,
            task_actual_end,
            user_update,
            task_manday,
            new Date(), // Update task_date_update with current date
            updatedTaskMemberId, // Use updatedTaskMemberId here
            taskId
        ]);

        await connection.promise().query('INSERT INTO history_tasks (task_id, task_name, task_detail, task_status, task_progress, task_Code, screen_id, project_id, system_id, task_plan_start, task_plan_end, task_actual_start, task_actual_end,  task_manday, update_date, user_update, task_member_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            currentTask[0].id,
            currentTask[0].task_name,
            currentTask[0].task_detail,
            currentTask[0].task_status,
            currentTask[0].task_progress,
            currentTask[0].task_id,
            currentTask[0].screen_id,
            currentTask[0].project_id,
            currentTask[0].system_id,
            currentTask[0].task_plan_start,
            currentTask[0].task_plan_end,
            currentTask[0].task_actual_start,
            currentTask[0].task_actual_end,
            currentTask[0].task_manday,
            currentTask[0].task_date_update,
            currentTask[0].user_update,
            updatedTaskMemberId // Use updatedTaskMemberId here as well
        ]);

        res.send('History task saved and task updated successfully');
    } catch (error) {
        console.error('Error saving history task and updating task:', error);
        res.status(500).send('Internal Server Error');
    }
});



// Route for getting history tasks by task_id
router.get('/history_tasks/:task_id', async (req, res) => {
    try {
        const taskId = req.params.task_id;

        // Query to select history tasks based on task_id
        const query = 'SELECT * FROM history_tasks WHERE task_id = ?';

        // Execute the query
        const historyTasks = await new Promise((resolve, reject) => {
            connection.query(query, [taskId], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });

        res.json(historyTasks);
    } catch (error) {
        console.error('Error fetching history tasks:', error);
        res.status(500).send('Internal Server Error');
    }
});


// Exporting the router
module.exports = router;
