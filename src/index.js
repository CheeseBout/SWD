require("dotenv").config();
const appConfig = require("./configs/app.config");
const express = require("express");
const cors = require("cors");
const app = express();
const port = appConfig.PORT;
const db = require("./configs/db.config");
const {
  errorConverter,
  errorHandler,
} = require("./middlewares/error.middleware");
const morgan = require("morgan");

db();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

const googleMeetRoutes = require("./routes/meet.route");
app.use("/api/v1/google-meet", googleMeetRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/v1", require("./routes"));
app.use("*", (req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use(errorConverter);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
