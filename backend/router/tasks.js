const express = require("express");
const router = express.Router();
const connection = require("../db");
const moment = require("moment");

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
    console.error("Error connecting to the database:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/createTasks", async (req, res) => {
  try {
    const {
      task_name,
      task_detail,
      task_type,
      screen_id,
      project_id,
      system_id,
      task_plan_start,
      task_plan_end,
      task_member_id,
      task_manday,
      task_member_create,

      imageFile,
      imageBase64,
    } = req.body;

    const id = generateId();
    const planStart = task_plan_start || null;
    const planEnd = task_plan_end || null;

    console.log(imageBase64)

    // Query to get all task_ids for the given screen_id
    const getTaskIdsQuery =
      "SELECT task_id FROM tasks WHERE screen_id = ? ORDER BY task_id";

    const taskIds = await new Promise((resolve, reject) => {
      connection.query(getTaskIdsQuery, [screen_id], (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });

    // Check if the provided task_id is unique within the screen
    const existingTaskIds = taskIds.map((task) => task.task_id);

    // If task_id is not provided, generate the next sequential task_id
    // let newTaskId = task_id;

    const lastTaskId =
      existingTaskIds.length > 0 ? Math.max(...existingTaskIds) : 0;

    newTaskId = lastTaskId + 1;

    const query =
      "INSERT INTO tasks (id, task_id, task_name, task_detail, task_type, screen_id, project_id, system_id, task_plan_start, task_plan_end, task_member_id, task_manday, task_member_create, task_date_update, task_pic ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)";

    await new Promise((resolve, reject) => {
      connection.query(
        query,
        [
          id,
          newTaskId,
          task_name,
          task_detail,
          task_type,
          screen_id,
          project_id,
          system_id,
          planStart,
          planEnd,
          task_member_id,
          task_manday,
          task_member_create,
          req.body.imageBase64,
        ],
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      );
    });

    res.send("Task created successfully");
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route for getting all tasks
router.get("/getAll", async (req, res) => {
  try {
    const query = "SELECT * FROM tasks "; // Adding condition in WHERE to filter only non-deleted data

    const results = await new Promise((resolve, reject) => {
      connection.query(query, async (err, tasks) => {
        if (err) reject(err);
        const formattedTasks = await Promise.all(
          tasks.map(async (task) => {
            const task_manday = moment
              .duration(
                moment(task.task_plan_end).diff(moment(task.task_plan_start))
              )
              .asDays();
            if (task.task_manday !== task_manday) {
              // Update task_manday in the database
              // Update task object with new task_manday
              return {
                ...task,
                task_manday: task_manday,
              };
            } else {
              return task;
            }
          })
        );
        resolve(formattedTasks);
      });
    });

    res.json(formatDates(results));
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route for getting a single task by ID
router.get("/getOne/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const query = "SELECT * FROM tasks WHERE id = ?";

    const task = await new Promise((resolve, reject) => {
      connection.query(query, [id], async (err, results) => {

        // console.log(results);

        if (err) reject(err);
        if (results.length === 0) {
          res.status(404).json({ error: "Task not found" });
        } else {
          const formattedTask = {
            ...results[0],
            task_plan_start: moment(results[0].task_plan_start).format(
              "YYYY-MM-DD"
            ),
            task_plan_end: moment(results[0].task_plan_end).format(
              "YYYY-MM-DD[Z]"
            ),
            task_actual_start: moment(results[0].task_actual_start).format(
              "YYYY-MM-DD"
            ),
            task_actual_end: moment(results[0].task_actual_end).format(
              "YYYY-MM-DD"
            ),
          };
          resolve(formattedTask);
        }
      });
    });

    res.json(formatDates([task]));
  } catch (error) {
    console.error("Error fetching task by ID:", error);
    res.status(500).send("Internal Server Error");
  }
});

// GET Tasks by Project ID
router.get("/searchByProjectId/:project_id", async (req, res) => {
  try {
    const { project_id } = req.params;

    // สร้าง query SQL โดยทำการ JOIN ระหว่างตาราง Tasks, Projects, Systems, และ Screens พร้อมเพิ่มการดึงคอลัมน์ is_archived และ task_actual_manday
    let query = `
            SELECT 
                tasks.task_id,
                tasks.task_name,
                tasks.task_detail,
                tasks.task_status,
                tasks.task_manday,
                tasks.task_progress,
                tasks.task_plan_start,
                tasks.task_plan_end,
                projects.project_name_ENG, 
                systems.system_nameEN, 
                screens.screen_name,
                tasks.project_id,
                tasks.system_id,
                tasks.screen_id,
                tasks.id,
                tasks.task_actual_start,
                tasks.task_actual_end,
                tasks.task_member_id,
                tasks.task_date_update,
                tasks.is_archived,
                tasks.task_actual_manday

            FROM tasks
            JOIN projects ON tasks.project_id = projects.id
            JOIN systems ON tasks.system_id = systems.id
            JOIN screens ON tasks.screen_id = screens.id
            WHERE tasks.project_id = ?
        `;

    // ดำเนินการคิวรีด้วย project_id ที่ให้ไว้
    connection.query(query, [project_id], async (err, results, fields) => {
      if (err) {
        console.error("Error fetching tasks by project ID:", err);
        return res.status(500).send("Internal Server Error");
      }

      // ตรวจสอบว่ามีข้อมูล tasks ที่สอดคล้องกับ project ID ที่ระบุหรือไม่
      if (results.length === 0) {
        return res
          .status(404)
          .json({ message: "No tasks found for this project ID" });
      }

      // ส่งข้อมูล tasks กลับในรูปแบบ JSON โดยรวมค่า is_archived และ task_actual_manday ด้วย
      res.status(200).json(results);
    });
  } catch (error) {
    console.error("Error fetching tasks by project ID:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/searchBySystemId/:system_id", async (req, res) => {
  try {
    const { system_id } = req.params;

    // สร้าง query SQL เพื่อดึงข้อมูล Tasks ตาม ID ระบบที่ระบุ พร้อมกรองข้อมูล Tasks ที่ถูกลบ
    const query = "SELECT * FROM tasks WHERE system_id = ?";

    const tasks = await new Promise((resolve, reject) => {
      connection.query(query, [system_id], async (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });

    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks by System ID:", error);
    res.status(500).send("Internal Server Error");
  }
});

// GET Screens by Screen id
router.get("/searchByScreenId/:screen_id", async (req, res) => {
  try {
    const { screen_id } = req.params;

    const query = `
            SELECT * FROM tasks
            WHERE screen_id = ? 
        `;

    connection.query(query, [screen_id], (err, tasks) => {
      if (err) {
        console.error("Error fetching tasks:", err);
        res.status(500).send("Internal Server Error");
        return;
      }

      res.json(tasks);
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Function to format dates
function formatDates(tasks) {
  return tasks.map((task) => ({
    ...task,
    task_plan_start: moment(task.task_plan_start).format("YYYY-MM-DD"),
    task_plan_end: moment(task.task_plan_end).format("YYYY-MM-DD"),
    task_actual_start: moment(task.task_actual_start).format("YYYY-MM-DD"),
    task_actual_end: moment(task.task_actual_end).format("YYYY-MM-DD"),
  }));
}

// Route for updating task data
// Route for updating task data
router.put("/updateTasks/:id", async (req, res) => {
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
      return res.status(400).json({ error: "No fields to update" });
    }

    const query = "UPDATE tasks SET ? WHERE id = ?";

    await new Promise((resolve, reject) => {
      connection.query(query, [updatedTaskFields, id], (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });

    res.send("Task updated successfully");
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).send("Internal Server Error");
  }
});

// ฟังก์ชันสำหรับนับวันทำงาน
function countBusinessDays(startDate, endDate) {
  let count = 0;
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return count;
}

// Route for deleting a task and related data
router.delete("/deleteHistoryTasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Delete from history_tasks where task_id matches the task being deleted
    const deleteHistoryTasksQuery =
      "DELETE FROM history_tasks WHERE task_id = ?";
    await new Promise((resolve, reject) => {
      connection.query(deleteHistoryTasksQuery, [id], (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });

    // Delete the task
    const deleteTasksQuery = "DELETE FROM tasks WHERE id = ?";
    await new Promise((resolve, reject) => {
      connection.query(deleteTasksQuery, [id], (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });

    res.send("Task and related data deleted successfully");
  } catch (error) {
    console.error("Error deleting task and related data:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route for saving history tasks and updating tasks
router.put("/save_history_tasks/:id", async (req, res) => {
  try {
    const taskId = req.params.id;

    // Get the current task data
    const [currentTask] = await connection
      .promise()
      .query("SELECT * FROM tasks WHERE id = ?", [taskId]);

    if (currentTask.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Update task data
    const {
      task_name,
      task_detail,
      task_status,
      task_manday,
      task_actual_manday,
      screen_id,
      project_id,
      task_type,
      system_id,
      task_progress,
      task_plan_start,
      task_plan_end,
      task_actual_start,
      task_actual_end,
      task_member_id,
      user_update,
      is_archived,
    } = req.body;

    // Use existing values if not provided
    const updatedTaskType =
      task_type !== undefined ? task_type : currentTask[0].task_type;
    const updatedScreenId =
      screen_id !== undefined ? screen_id : currentTask[0].screen_id;
    const updatedProjectId =
      project_id !== undefined ? project_id : currentTask[0].project_id;
    const updatedSystemId =
      system_id !== undefined ? system_id : currentTask[0].system_id;
    const updatedTaskMemberId =
      task_member_id !== undefined
        ? task_member_id
        : currentTask[0].task_member_id;

    // Get the current date and time for task_date_update
    const currentDateTime = new Date();

    // Set task_actual_end to null if task_progress is less than 100
    const updatedTaskActualEnd =
      task_progress < 100
        ? null
        : task_actual_end || currentTask[0].task_actual_end;

    // ตั้งค่า task_actual_manday เป็น 0 หาก task_actual_end เป็น null
    const updatedTaskActualManday =
      updatedTaskActualEnd === null && task_progress < 100
        ? 0
        : task_actual_manday || currentTask[0].task_actual_manday;

    // Update the task in the database, including is_archived field
    await connection.promise().query(
      `UPDATE tasks 
       SET task_name=?, task_detail=?, task_status=?, task_manday=?, task_actual_manday=?, screen_id=?, project_id=?,
           task_type=?, system_id=?, task_progress=?, task_plan_start=?, task_plan_end=?, 
           task_actual_start=?, task_actual_end=?, user_update=?, task_member_id=?, task_date_update=?, is_archived=?
       WHERE id=?`,
      [
        task_name || currentTask[0].task_name,
        task_detail || currentTask[0].task_detail,
        task_status || currentTask[0].task_status,
        task_manday || currentTask[0].task_manday,
        updatedTaskActualManday,
        updatedScreenId,
        updatedProjectId,
        updatedTaskType,
        updatedSystemId,
        task_progress !== undefined
          ? task_progress
          : currentTask[0].task_progress,
        task_plan_start || currentTask[0].task_plan_start,
        task_plan_end || currentTask[0].task_plan_end,
        task_actual_start || currentTask[0].task_actual_start,
        updatedTaskActualEnd, // Use the new value that was checked
        user_update || currentTask[0].user_update,
        updatedTaskMemberId,
        currentDateTime, // Set the current date and time for task_date_update
        is_archived !== undefined ? is_archived : currentTask[0].is_archived, // Set is_archived
        taskId,
      ]
    );

    // Insert into history_tasks table without is_archived field
    await connection.promise().query(
      `INSERT INTO history_tasks 
       (task_id, task_name, task_detail, task_status, task_progress, task_Code, screen_id, project_id, 
        system_id, task_plan_start, task_plan_end, task_actual_start, task_actual_end, task_manday, 
        update_date, user_update, task_member_id, task_type, is_deleted) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
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
        currentTask[0].task_date_update, // Use the old task_date_update for update_date
        user_update || currentTask[0].user_update,
        updatedTaskMemberId,
        updatedTaskType,
        0, // Set is_deleted to 0
      ]
    );

    res.send("History task saved and task updated successfully");
  } catch (error) {
    console.error("Error saving history task and updating task:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route for getting history tasks by task_id
router.get("/history_tasks/:task_id", async (req, res) => {
  try {
    const taskId = req.params.task_id;

    // Query to select history tasks based on task_id
    const query = "SELECT * FROM history_tasks WHERE task_id = ?";

    // Execute the query
    const historyTasks = await new Promise((resolve, reject) => {
      connection.query(query, [taskId], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });

    res.json(historyTasks);
  } catch (error) {
    console.error("Error fetching history tasks:", error);
    res.status(500).send("Internal Server Error");
  }
});
function countBusinessDays(startDate, endDate) {
  let count = 0;
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return count;
}

// Route for counting tasks based on screen_id
router.get("/countByScreen/:screen_id", async (req, res) => {
  const screenId = req.params.screen_id;

  try {
    // SQL query to count tasks for the given screen_id
    const query =
      "SELECT COUNT(*) AS taskCount FROM history_tasks WHERE screen_id = ? AND is_deleted = 0";

    const results = await new Promise((resolve, reject) => {
      connection.query(query, [screenId], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0]);
        }
      });
    });

    // Return the count in the response
    res.json({ screen_id: screenId, task_count: results.taskCount });
  } catch (error) {
    console.error("Error counting tasks:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Exporting the router
module.exports = router;
