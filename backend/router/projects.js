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
    const projectIdFilter = req.query.project_id;
    let query = `
      SELECT 
        projects.*,
        COUNT(DISTINCT Systems.id) AS system_count,
        AVG(Systems.system_progress) AS project_progress,
        DATE_FORMAT(MIN(Systems.system_plan_start), '%Y-%m-%d') AS project_plan_start,
        DATE_FORMAT(MAX(Systems.system_plan_end), '%Y-%m-%d') AS project_plan_end,
        DATEDIFF(MAX(Systems.system_plan_end), MIN(Systems.system_plan_start)) AS project_manday
      FROM 
        projects 
      LEFT JOIN Systems ON projects.id = Systems.project_id`;

    const queryParams = [];

    if (projectIdFilter) {
      query += " WHERE projects.id = ?";
      queryParams.push(projectIdFilter);
    }

    query += " GROUP BY projects.id";

    connection.query(query, queryParams, async (err, results, fields) => {
      if (err) {
        console.error(err);
        return res.status(500).send();
      }

      // Filter out deleted projects
      const filteredResults = results.filter((project) => !project.is_deleted);

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
        COUNT(DISTINCT Systems.id) AS system_count,
        AVG(Systems.system_progress) AS project_progress,
        DATE_FORMAT(MIN(Systems.system_plan_start), '%Y-%m-%d') AS project_plan_start,
        DATE_FORMAT(MAX(Systems.system_plan_end), '%Y-%m-%d') AS project_plan_end,
        DATEDIFF(MAX(Systems.system_plan_end), MIN(Systems.system_plan_start)) AS project_manday
      FROM 
        projects 
      LEFT JOIN Systems ON projects.id = Systems.project_id
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
          return res.status(404).json({ error: "Project not found" });
        }
        // Check if project is deleted
        if (results[0].is_deleted) {
          return res.status(404).json({ error: "Project not found" });
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

// Route to fetch deleted projects
router.get("/getHistoryProject", async (req, res) => {
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

// Function to update project data
async function updateProject(project) {
  try {
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

    const {
      project_progress,
      system_count,
      project_plan_start,
      project_plan_end,
      project_manday,
    } = project;

    await new Promise((resolve, reject) => {
      connection.query(
        updateQuery,
        [
          project_progress,
          system_count,
          project_plan_start,
          project_plan_end,
          project_manday,
          project.id,
        ],
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

router.post("/createProject", async (req, res) => {
  const {
    project_id,
    project_name_TH,
    project_name_ENG,
    selectedSA,
    selectedDEV,
    selectedIMP,
  } = req.body;

  const id = generateId(); // Generate ID using generateId() function

  try {
    connection.query(
      "INSERT INTO projects (id, project_id, project_name_TH, project_name_ENG, project_shortname, project_agency, project_progress, project_manday, system_count, project_plan_start, project_plan_end, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        project_id,
        project_name_TH,
        project_name_ENG,
        "",
        0,
        0,
        0,
        0,
        null,
        null,
        false,
      ],
      (err, results, fields) => {
        if (err) {
          console.error(
            "Error while inserting a project into the database",
            err
          );
          return res.status(400).send();
        }

        // Create user_project relations if TeamMembers are provided
        if (selectedSA || selectedDEV || selectedIMP) {
          const users = [
            ...(selectedSA || []),
            ...(selectedDEV || []),
            ...(selectedIMP || []),
          ];
          const userProjectValues = users.map((user_id) => [user_id, id]);

          connection.query(
            "INSERT INTO user_projects (user_id, project_id) VALUES ?",
            [userProjectValues],
            (error, results, fields) => {
              if (error) {
                console.error(
                  "Error while inserting users into the project",
                  error
                );
                return res.status(400).send();
              }
              return res
                .status(201)
                .json({ message: "New project successfully created!" });
            }
          );
        } else {
          return res
            .status(201)
            .json({ message: "New project successfully created!" });
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
  const { project_id, project_name_TH, project_name_ENG, is_deleted } =
    req.body;

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

    if (
      !project_id &&
      !project_name_TH &&
      !project_name_ENG &&
      is_deleted === undefined
    ) {
      return res.status(200).json(previousProjectData);
    }

    connection.query(
      "UPDATE projects SET project_id = ?, project_name_TH = ?, project_name_ENG = ?, is_deleted = ? WHERE id = ?",
      [
        project_id || req.body.project_id || previousProjectData.project_id,
        project_name_TH ||
          req.body.project_name_TH ||
          previousProjectData.project_name_TH,
        project_name_ENG ||
          req.body.project_name_ENG ||
          previousProjectData.project_name_ENG,
        is_deleted !== undefined ? is_deleted : previousProjectData.is_deleted,
        id,
      ],
      (err, results, fields) => {
        if (err) {
          console.error(err);
          return res.status(400).send();
        }
        return res
          .status(200)
          .json({ message: "Project updated successfully!" });
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
        return res
          .status(200)
          .json({ message: "Project deleted successfully!" });
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
        return res
          .status(200)
          .json({ message: "Project and related data deleted successfully!" });
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
