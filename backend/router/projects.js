const express = require("express");
const router = express.Router();
const connection = require("../db");

// Function to generate a random ID
function generateId() {
  const maxId = 999999999;
  const minId = 100000000;
  const id = Math.floor(Math.random() * (maxId - minId + 1)) + minId;
  return id;
}

//* GET All FROM projects
router.get("/getAll", async (req, res) => {
  try {

    let query = `
      SELECT 
        projects.*,
        COUNT(DISTINCT CASE WHEN systems.is_deleted = 0 THEN systems.id ELSE NULL END) AS system_count,
        AVG(CASE WHEN systems.is_deleted = 0 THEN systems.system_progress ELSE NULL END) AS project_progress,
        DATE_FORMAT(MIN(CASE WHEN systems.is_deleted = 0 THEN systems.system_plan_start END), '%Y-%m-%d') AS project_plan_start,
        DATE_FORMAT(MAX(CASE WHEN systems.is_deleted = 0 THEN systems.system_plan_end END), '%Y-%m-%d') AS project_plan_end,
        DATEDIFF(MAX(CASE WHEN systems.is_deleted = 0 THEN systems.system_plan_end END), MIN(CASE WHEN systems.is_deleted = 0 THEN systems.system_plan_start END)) AS project_manday
      FROM 
        projects 
      LEFT JOIN systems ON projects.id = systems.project_id`;

    const queryParams = [];



    query += " GROUP BY projects.id";

    connection.query(query, queryParams, async (err, results, fields) => {
      if (err) {
        console.error(err);
        return res.status(500).send();
      }

      // Filter out deleted projects
      const filteredResults = results.filter(project => !project.is_deleted);

      // Update project data in the database
      for (const project of filteredResults) {
        const updatedProject = await updateProject(project);
        Object.assign(project, updatedProject);
      }

      res.status(200).json(filteredResults);
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
});

//* GET one by id
router.get("/getOne/:id", async (req, res) => {
  const id = req.params.id;
  try {
    connection.query(
      `
      SELECT 
        projects.*,
        COUNT(DISTINCT CASE WHEN systems.is_deleted = 0 THEN systems.id ELSE NULL END) AS system_count,
        AVG(CASE WHEN systems.is_deleted = 0 THEN systems.system_progress ELSE NULL END) AS project_progress,
        DATE_FORMAT(MIN(CASE WHEN systems.is_deleted = 0 THEN systems.system_plan_start END), '%Y-%m-%d') AS project_plan_start,
        DATE_FORMAT(MAX(CASE WHEN systems.is_deleted = 0 THEN systems.system_plan_end END), '%Y-%m-%d') AS project_plan_end,
        DATEDIFF(MAX(CASE WHEN systems.is_deleted = 0 THEN systems.system_plan_end END), MIN(CASE WHEN systems.is_deleted = 0 THEN systems.system_plan_start END)) AS project_manday
      FROM 
        projects 
      LEFT JOIN systems ON projects.id = systems.project_id
      WHERE projects.id = ?
      GROUP BY projects.id
      `,
      [id],
      async (err, results, fields) => {
        if (err) {
          console.error(err);
          return res.status(400).send();
        }
        if (results.length === 0) {
          return res.status(404).json({ error: 'Project not found' });
        }
        // Check if project is deleted
        if (results[0].is_deleted) {
          return res.status(404).json({ error: 'Project not found' });
        }
        // Update project data in the database
        const updatedProject = await updateProject(results[0]);
        return res.status(200).json(updatedProject);
      }
    );
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
});
// Function to update project data
async function updateProject(project) {
  try {
    const {project_progress, system_count, project_plan_start, project_plan_end, project_manday } = project;

    // Check and set default values for null columns
    const updatedProjectProgress = project_progress !== null ? project_progress : 0;
    const updatedSystemCount = system_count !== null ? system_count : 0;
    // You may need to adjust the default values for date columns accordingly
    const updatedProjectPlanStart = project_plan_start !== null ? project_plan_start : new Date();
    const updatedProjectPlanEnd = project_plan_end !== null ? project_plan_end : new Date();
    const updatedProjectManday = project_manday !== null ? project_manday : 0;

    const updateQuery = `
      UPDATE projects 
      SET 
        project_progress = ?,
        system_count = ?,
        project_plan_start = ?,
        project_plan_end = ?,
        project_manday = ?
      WHERE id = ?
    `;

    await new Promise((resolve, reject) => {
      connection.query(
        updateQuery,
        [updatedProjectProgress, updatedSystemCount, updatedProjectPlanStart, updatedProjectPlanEnd, updatedProjectManday, project.id],
        (err, result) => {
          if (err) reject(err);
          resolve(project);
        }
      );
    });

    return project;
  } catch (error) {
    throw error;
  }
}




// Route to fetch deleted projects
router.get('/getHistoryProject', async (req, res) => {
  try {
    // Query to fetch projects that are marked as deleted
    const query = `
      SELECT *
      FROM projects
      WHERE is_deleted = 1
    `;

    // Execute the query
    connection.query(query, (err, results, fields) => {
      if (err) {
        console.error(err);
        return res.status(500).send();
      }
      return res.status(200).json(results);
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
});



router.post("/createProject", async (req, res) => {
  const { project_name_TH, project_name_ENG, selectedSA, selectedDEV, selectedIMP } = req.body;

  const id = generateId(); // Generate ID using generateId() function

  try {
    connection.query(
      "INSERT INTO projects (id,  project_name_TH, project_name_ENG, project_progress, project_manday, system_count, project_plan_start, project_plan_end, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, project_name_TH, project_name_ENG, 0, 0, 0, null, null, false],
      (err, results, fields) => {
        if (err) {
          console.error("Error while inserting a project into the database", err);
          return res.status(400).send();
        }

        // Create user_project relations if TeamMembers are provided
        if (selectedSA || selectedDEV || selectedIMP) {
          const users = [...(selectedSA || []), ...(selectedDEV || []), ...(selectedIMP || [])];
          const userProjectValues = users.map(user_id => [user_id, id]);

          connection.query(
            "INSERT INTO user_projects (user_id, project_id) VALUES ?",
            [userProjectValues],
            (error, results, fields) => {
              if (error) {
                console.error("Error while inserting users into the project", error);
                return res.status(400).send();
              }
              return res.status(201).json({ message: "New project successfully created!" });
            }
          );
        } else {
          return res.status(201).json({ message: "New project successfully created!" });
        }
      }
    );
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
});



// Route to update project
router.put("/updateProject/:id", async (req, res) => {
  const id = req.params.id;
  const { project_name_TH, project_name_ENG, is_deleted } = req.body;

  try {
    const previousProjectData = await new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM projects WHERE id = ?",
        [id],
        (err, results, fields) => {
          if (err) reject(err);
          resolve(results[0]);
        }
      );
    });

    if (!project_name_TH && !project_name_ENG && is_deleted === undefined) {
      return res.status(200).json(previousProjectData);
    }

    connection.query(
      "UPDATE projects SET  project_name_TH = ?, project_name_ENG = ?, is_deleted = ? WHERE id = ?",
      [
        project_name_TH || req.body.project_name_TH || previousProjectData.project_name_TH,
        project_name_ENG || req.body.project_name_ENG || previousProjectData.project_name_ENG,
        is_deleted !== undefined ? is_deleted : previousProjectData.is_deleted,
        id,
      ],
      (err, results, fields) => {
        if (err) {
          console.error(err);
          return res.status(400).send();
        }
        return res.status(200).json({ message: "Project updated successfully!" });
      }
    );
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
});


// Route to soft delete a project
router.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;

  try {
    connection.query(
      "UPDATE projects SET is_deleted = true WHERE id = ?",
      [id],
      (err, results, fields) => {
        if (err) {
          console.error(err);
          return res.status(500).send();
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ message: "No project with that id!" });
        }
        return res.status(200).json({ message: "Project deleted successfully!" });
      }
    );
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
});

router.delete("/deleteHistoryProject/:id", async (req, res) => {
  const id = req.params.id;

  try {
    // Execute the delete history project trigger
    connection.query(
      `
      DELETE FROM projects
      WHERE id = ?
      `,
      [id],
      (err, results, fields) => {
        if (err) {
          console.error(err);
          return res.status(500).send();
        }
        return res.status(200).json({ message: "Project and related data deleted successfully!" });
      }
    );
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
});




// Route to add user-project mappings
router.post("/addUserProject", async (req, res) => {
  const { user_id, project_ids } = req.body;
  try {
    const createUserProjects = (user_id, project_ids) => {
      // Check that project_ids is an array
      if (!Array.isArray(project_ids)) {
        console.error("Error: project_ids is not an array");
        return;
      }
      project_ids.forEach((project_id) => {
        connection.query(
          "INSERT INTO user_projects (user_id, project_id) VALUES (?, ?)",
          [user_id, project_id],
          (error, results, fields) => {
            if (error) {
              console.error(
                `Error while creating user-project mapping for user ${user_id} and project ${project_id}`,
                error
              );
            }
          }
        );
      });
    };
    createUserProjects(user_id, project_ids);
    return res.status(200).send("User-project mappings created successfully");
  } catch (err) {
    console.error("Error while creating user-project mappings", err);
    return res.status(500).send();
  }
});

module.exports = router;
