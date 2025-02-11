const router = require("express").Router();
const authRouter = require("./auth.route");
const userRouter = require("./user.route");
const topicRouter = require("./topic.route");
const questionRouter = require("./questions.route");
const optionsRouter = require("./options.route");
router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/topics", topicRouter);
router.use("/questions", questionRouter);
router.use("/options", optionsRouter);

module.exports = router;
