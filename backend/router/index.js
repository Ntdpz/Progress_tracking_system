const router = require("express").Router();

const usersRouter = require("./users");
const projectsRouter = require("./projects");
const systemsRouter = require("./systems");
const screensRouter = require("./screens");
const issuesRouter = require("./issues");
const notificationsRouter = require("./notifications");
const default_settingsRouter = require("./default_settings");
const user_screensRouter = require("./user_screens");
const authRouter = require("./auth");

router.use("/users", usersRouter);
router.use("/projects", projectsRouter);
router.use("/systems", systemsRouter);
router.use("/screens", screensRouter);
router.use("/issues", issuesRouter);
router.use("/notifications", notificationsRouter);
router.use("/default_settings", default_settingsRouter);
router.use("/user_screens", user_screensRouter);
router.use("/auth", authRouter);

module.exports = router;
