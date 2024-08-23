const router = require("express").Router();

const usersRouter = require("./users");
const projectsRouter = require("./projects");
const systemsRouter = require("./systems");
const screensRouter = require("./screens");
const taskRouters = require("./tasks");

const issuesRouter = require("./issues");
const notificationsRouter = require("./notifications");
const default_settingsRouter = require("./default_settings");
const user_projectsRouter = require("./user_projects");
const user_screensRouter = require("./user_screens");
const user_systemsRouter = require("./user_systems");
const pdfRouter = require("./pdf");
const authRouter = require("./auth");
const history_issuesRouter = require("./history_issues");

const dashboard = require("./Note_Management/dashboard");


router.use("/users", usersRouter);
router.use("/projects", projectsRouter);
router.use("/systems", systemsRouter);
router.use("/screens", screensRouter);
router.use("/tasks", taskRouters);

router.use("/issues", issuesRouter);
router.use("/notifications", notificationsRouter);
router.use("/default_settings", default_settingsRouter);
router.use("/user_projects", user_projectsRouter);
router.use("/user_screens", user_screensRouter);
router.use("/user_systems", user_systemsRouter);
router.use("/pdf", pdfRouter);
router.use("/auth", authRouter);
router.use("/history_issues", history_issuesRouter);

router.use("/dashboard", dashboard);

module.exports = router;
