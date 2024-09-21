const express = require('express');
const router = express.Router();
const connection = require('../db'); // Import database connection
const path = require('path');
const { db, connectToDatabase } = require(path.join(__dirname, '../db')); // Import database utilities
const moment = require('moment'); // Import moment library for date manipulation

// Function to generate a random ID
function generateId() {
  const maxId = 999999999;
  const minId = 100000000;
  const id = Math.floor(Math.random() * (maxId - minId + 1)) + minId;
  return id;
}

router.get('/getAll', async (req, res) => {
  try {
    const systemIdFilter = req.query.system_id;
    const projectFilter = req.query.project_id;
    let query = `
      SELECT systems.id, 
             systems.project_id,
           
             systems.system_nameTH,
             systems.system_nameEN,
             systems.system_shortname,
             systems.is_deleted,
             COUNT(CASE WHEN screens.is_deleted = 0 THEN screens.screen_code ELSE NULL END) AS screen_count,
             IFNULL(SUM(CASE WHEN screens.is_deleted = 0 THEN IFNULL(screens.screen_progress, 0) ELSE 0 END) / NULLIF(COUNT(CASE WHEN screens.is_deleted = 0 THEN screens.screen_progress END), 0), 0) AS system_progress,
             DATE_FORMAT(MIN(CASE WHEN screens.is_deleted = 0 THEN screens.screen_plan_start END), '%Y-%m-%d') AS system_plan_start,
             DATE_FORMAT(MAX(CASE WHEN screens.is_deleted = 0 THEN screens.screen_plan_end END), '%Y-%m-%d') AS system_plan_end,
             DATEDIFF(MAX(CASE WHEN screens.is_deleted = 0 THEN screens.screen_plan_end END), MIN(CASE WHEN screens.is_deleted = 0 THEN screens.screen_plan_start END)) AS system_manday,
             systems.is_deleted
      FROM systems
      LEFT JOIN screens ON systems.id = screens.system_id
    `;
    const queryParams = [];

    if (projectFilter) {
      query += ' WHERE systems.project_id = ? AND systems.is_deleted = false';
      queryParams.push(projectFilter);
    } else if (systemIdFilter) {
      query += ' WHERE systems.id = ? AND systems.is_deleted = false';
      queryParams.push(systemIdFilter);
    } else {
      query += ' WHERE systems.is_deleted = false';
    }

    query += ' GROUP BY systems.id';

    // Execute the query
    connection.query(query, queryParams, async (err, results, fields) => {
      if (err) {
        console.error(err);
        return res.status(400).send();
      }
      // Format system_plan_start and system_plan_end to contain only date
      for (const system of results) {
        const updatedSystem = await updateSystem(system); // Update system data
        Object.assign(system, updatedSystem);
      }
      res.status(200).json(results);
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
});

router.get('/getOne/:id', async (req, res) => {
  const id = req.params.id;
  try {
    connection.query(
      `SELECT 
          systems.*,
          COUNT(CASE WHEN screens.is_deleted = 0 THEN screens.screen_code ELSE NULL END) AS screen_count,
          IFNULL(SUM(CASE WHEN screens.is_deleted = 0 THEN IFNULL(screens.screen_progress, 0) ELSE 0 END) / NULLIF(COUNT(CASE WHEN screens.is_deleted = 0 THEN screens.screen_progress END), 0), 0) AS system_progress,
          DATE_FORMAT(MIN(CASE WHEN screens.is_deleted = 0 THEN screens.screen_plan_start END), '%Y-%m-%d') AS system_plan_start,
          DATE_FORMAT(MAX(CASE WHEN screens.is_deleted = 0 THEN screens.screen_plan_end END), '%Y-%m-%d') AS system_plan_end,
          DATEDIFF(MAX(CASE WHEN screens.is_deleted = 0 THEN screens.screen_plan_end END), MIN(CASE WHEN screens.is_deleted = 0 THEN screens.screen_plan_start END)) AS system_manday,
          systems.is_deleted
      FROM systems
      LEFT JOIN screens ON systems.id = screens.system_id
      WHERE systems.id = ?
      GROUP BY systems.id`,
      [id],
      (err, results, fields) => {
        if (err) {
          console.error(err);
          return res.status(400).send();
        }
        if (results.length === 0) {
          return res.status(404).json({ message: 'System not found!' });
        }
        const system = results[0];
        if (system.is_deleted === 1) {
          return res.status(200).json({ message: 'This system has been deleted.' });
        }
        res.status(200).json(system);
      }
    );
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
});


router.get('/searchByProjectId/:project_id', async (req, res) => {
  try {
    const { project_id } = req.params;

    let query = `
      SELECT systems.id,
             systems.project_id,
          
             systems.system_nameTH,
             systems.system_nameEN,
             systems.system_shortname,
             systems.is_deleted,
             COUNT(CASE WHEN screens.is_deleted = 0 THEN screens.screen_code ELSE NULL END) AS screen_count,
             IFNULL(SUM(CASE WHEN screens.is_deleted = 0 THEN IFNULL(screens.screen_progress, 0) ELSE 0 END) / NULLIF(COUNT(CASE WHEN screens.is_deleted = 0 THEN screens.screen_progress END), 0), 0) AS system_progress,
             DATE_FORMAT(MIN(CASE WHEN screens.is_deleted = 0 THEN screens.screen_plan_start END), '%Y-%m-%d') AS system_plan_start,
             DATE_FORMAT(MAX(CASE WHEN screens.is_deleted = 0 THEN screens.screen_plan_end END), '%Y-%m-%d') AS system_plan_end,
             DATEDIFF(MAX(CASE WHEN screens.is_deleted = 0 THEN screens.screen_plan_end END), MIN(CASE WHEN screens.is_deleted = 0 THEN screens.screen_plan_start END)) AS system_manday
      FROM systems
      LEFT JOIN screens ON systems.id = screens.system_id
      WHERE systems.project_id = ? AND systems.is_deleted = false
      GROUP BY systems.id
    `;

    // Execute the query
    connection.query(query, [project_id], async (err, results, fields) => {
      if (err) {
        console.error(err);
        return res.status(400).send();
      }
      // Format system_plan_start and system_plan_end to contain only date
      for (const system of results) {
        const updatedSystem = await updateSystem(system); // Update system data
        Object.assign(system, updatedSystem);
      }
      res.status(200).json(results);
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
});


// Function to update system data
async function updateSystem(system) {
  try {
    const updateQuery = `
      UPDATE systems 
      SET 
        screen_count = ?,
        system_progress = ?,
        system_plan_start = ?, 
        system_plan_end = ?,
        system_manday = ?
      WHERE id = ?
    `;

    // Prepare updated system data
    const updatedSystem = {
      screen_count: system.screen_count,
      // Check if system_progress is null, then set it to 0
      system_progress: system.system_progress !== null ? system.system_progress : 0,
      // Check if screen_progress is null, then set it to 0
      screen_progress: system.screen_progress || 0,
      // Check if system_plan_start and system_plan_end are null, then keep them as null
      system_plan_start: system.system_plan_start ? new Date(system.system_plan_start).toISOString().split('T')[0] : null,
      system_plan_end: system.system_plan_end ? new Date(system.system_plan_end).toISOString().split('T')[0] : null,
      system_manday: system.system_manday,
      id: system.id
    };

    // Execute the update query
    await new Promise((resolve, reject) => {
      connection.query(updateQuery, [updatedSystem.screen_count, updatedSystem.system_progress, updatedSystem.system_plan_start, updatedSystem.system_plan_end, updatedSystem.system_manday, updatedSystem.id], (err, result) => {
        if (err) reject(err);
        resolve(updatedSystem);
      });
    });

    return updatedSystem;
  } catch (err) {
    throw err;
  }
}



// Route to get all systems by project_id
router.get('/getAll/:project_id', async (req, res) => {
  const projectId = req.params.project_id;
  try {
    const query = `
      SELECT systems.id,
             systems.project_id,
            
             systems.system_nameTH,
             systems.system_nameEN,
             systems.system_shortname,
             systems.is_deleted,
             COUNT(screens.screen_code) AS screen_count,
             AVG(screens.screen_progress) AS system_progress,
             DATE_FORMAT(MIN(screens.screen_plan_start), '%Y-%m-%d') AS system_plan_start,
             DATE_FORMAT(MAX(screens.screen_plan_end), '%Y-%m-%d') AS system_plan_end,
             DATEDIFF(MAX(screens.screen_plan_end), MIN(screens.screen_plan_start)) AS system_manday
      FROM systems
      LEFT JOIN screens ON systems.id = screens.system_id
      WHERE systems.project_id = ? AND systems.is_deleted = false
      GROUP BY systems.id
    `;

    connection.query(query, [projectId], async (err, results, fields) => {
      if (err) {
        console.error(err);
        return res.status(400).send();
      }
      // Format system_plan_start and system_plan_end to contain only date
      for (const system of results) {
        const updatedSystem = await updateSystem(system); // Update system data
        Object.assign(system, updatedSystem);
      }
      res.status(200).json(results);
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
});

// Route to get all historical systems
router.get('/getAllHistorySystem', async (req, res) => {
  try {
    let query = `
      SELECT systems.id,
             systems.project_id,
            
             systems.system_nameTH,
             systems.system_nameEN,
             systems.system_shortname,
             systems.is_deleted,
             COUNT(screens.screen_code) AS screen_count,
             AVG(screens.screen_progress) AS system_progress,
             DATE_FORMAT(MIN(screens.screen_plan_start), '%Y-%m-%d') AS system_plan_start,
             DATE_FORMAT(MAX(screens.screen_plan_end), '%Y-%m-%d') AS system_plan_end,
             DATEDIFF(MAX(screens.screen_plan_end), MIN(screens.screen_plan_start)) AS system_manday,
             systems.is_deleted /* Include the 'is_deleted' field in the SELECT clause */
      FROM systems
      LEFT JOIN screens ON systems.id = screens.system_id
      WHERE systems.is_deleted = 1 /* Filter only deleted systems */
      GROUP BY systems.id
    `;

    // Execute the query
    connection.query(query, async (err, results, fields) => {
      if (err) {
        console.error(err);
        return res.status(400).send();
      }
      // Format system_plan_start and system_plan_end to contain only date
      for (const system of results) {
        const updatedSystem = await updateSystem(system); // Update system data
        Object.assign(system, updatedSystem);
      }
      res.status(200).json(results);
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
});

// Route to search deleted systems by project_id
router.get('/searchByProjectId_delete/:project_id', async (req, res) => {
  try {
    const { project_id } = req.params;

    let query = `
      SELECT systems.id,
             systems.project_id,
             systems.system_nameTH,
             systems.system_nameEN,
             systems.system_shortname,
             systems.is_deleted,
             COUNT(screens.screen_code) AS screen_count,
             AVG(screens.screen_progress) AS system_progress,
             DATE_FORMAT(MIN(screens.screen_plan_start), '%Y-%m-%d') AS system_plan_start,
             DATE_FORMAT(MAX(screens.screen_plan_end), '%Y-%m-%d') AS system_plan_end,
             DATEDIFF(MAX(screens.screen_plan_end), MIN(screens.screen_plan_start)) AS system_manday
      FROM systems
      LEFT JOIN screens ON systems.id = screens.system_id
      WHERE systems.project_id = ? AND systems.is_deleted = 1
      GROUP BY systems.id
    `;

    // Execute the query
    connection.query(query, [project_id], async (err, results, fields) => {
      if (err) {
        console.error(err);
        return res.status(400).send();
      }
      // Format system_plan_start and system_plan_end to contain only date
      for (const system of results) {
        const updatedSystem = await updateSystem(system); // Update system data
        Object.assign(system, updatedSystem);
      }
      res.status(200).json(results);
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
});

// API createSystem
router.post("/createSystem", async (req, res) => {
  const {
    project_id,
    system_nameTH,
    system_nameEN,
    system_shortname,
    selectedUser, // ตรวจสอบว่า selectedUser มีค่าเป็น array หรือไม่
  } = req.body;

  const id = generateId(); // Generate a valid ID using generateId() function

  try {
    connection.query(
      "INSERT INTO systems (id, project_id, system_nameTH, system_nameEN, system_shortname) VALUES (?, ?, ?, ?, ?)",
      [id, project_id, system_nameTH, system_nameEN, system_shortname], // Use the generated ID
      (err, results, fields) => {
        if (err) {
          console.error("Error while inserting a system into the database", err);
          return res.status(400).send();
        }

        // Create user_system relations if selectedUsers are provided
        if (Array.isArray(selectedUser) && selectedUser.length > 0) {
          const userSystemValues = selectedUser.map((user_id) => [
            user_id,
            id, // Use the provided system_id
            project_id,
          ]);

          connection.query(
            "INSERT INTO user_systems (user_id, system_id, project_id) VALUES ?",
            [userSystemValues],
            (error, results, fields) => {
              if (error) {
                console.error("Error while inserting users into the system", error);
                return res.status(400).send();
              }
              return res
                .status(201)
                .json({ message: "New system and users assigned successfully!", system_id: id }); // Return the system_id
            }
          );
        } else {
          return res
            .status(201)
            .json({ message: "New system created successfully!", system_id: id }); // Return the system_id
        }
      }
    );
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
});



// Route to update system details
router.put('/updateSystem/:id', async (req, res) => {
  const id = req.params.id;
  const {
    system_nameTH,
    system_nameEN,
    system_shortname,
    project_id,
    is_deleted // เพิ่ม is_deleted เข้ามาในการรับค่า
  } = req.body;

  const updatedSystemFields = {};

  if (system_nameTH !== undefined) {
    updatedSystemFields.system_nameTH = system_nameTH;
  }

  if (system_nameEN !== undefined) {
    updatedSystemFields.system_nameEN = system_nameEN;
  }

  if (system_shortname !== undefined) {
    updatedSystemFields.system_shortname = system_shortname;
  }

  if (project_id !== undefined) {
    updatedSystemFields.project_id = project_id;
  }

  if (is_deleted !== undefined) { // เพิ่มเงื่อนไขสำหรับ is_deleted
    updatedSystemFields.is_deleted = is_deleted;
  }

  if (Object.keys(updatedSystemFields).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  try {
    connection.query(
      'UPDATE systems SET ? WHERE id = ?',
      [updatedSystemFields, id],
      (err, results, fields) => {
        if (err) {
          console.error(err);
          return res.status(400).send();
        }
        res.status(200).json({ message: 'System updated successfully!' });
      }
    );
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
});


// Route to delete a system by id
router.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;

  try {
    connection.query(
      "UPDATE systems SET is_deleted = true WHERE id = ?",
      [id],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          return res.status(500).send();
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ message: "No system with that id!" });
        }
        return res.status(200).json({ message: "System deleted successfully!" });
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

// Route to delete a system and related data
router.delete("/deleteHistorySystems/:id", async (req, res) => {
  const id = req.params.id;

  try {
    // Execute the delete history system trigger
    connection.query(
      `
      DELETE FROM systems
      WHERE id = ?
      `,
      [id],
      (err, results, fields) => {
        if (err) {
          console.error(err);
          return res.status(500).send();
        }
        return res.status(200).json({ message: "System and related data deleted successfully!" });
      }
    );
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
});







// Route to add user to systems
router.post('/addUserSystem', async (req, res) => {
  const { user_id, system_ids } = req.body;
  try {
    const createUserSystemMappings = async (user_id, system_ids) => {
      // Check that system_ids is an array
      if (!Array.isArray(system_ids)) {
        console.error('Error: system_ids is not an array');
        return res.status(400).send('system_ids must be an array');
      }

      // Map over the system IDs and insert a new row into the user_systems table for each one
      for (const system_id of system_ids) {
        try {
          await connection.query(
            'INSERT INTO user_systems (user_id, system_id) VALUES (?, ?)',
            [user_id, system_id]
          );
        } catch (error) {
          console.error(
            `Error while creating user-system mapping for user ${user_id} and system ${system_id}`,
            error
          );
          return res
            .status(500)
            .send(
              `Error while creating user-system mapping for user ${user_id} and system ${system_id}`
            );
        }
      }

      return res.status(200).send('User-system mappings created successfully');
    };
    await createUserSystemMappings(user_id, system_ids);
  } catch (err) {
    console.error('Error while creating user-system mappings', err);
    return res.status(500).send('Internal Server Error');
  }
});

module.exports = router;