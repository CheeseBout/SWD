require("dotenv").config();
const appConfig = require("./configs/app.config");
const express = require("express");
const cors = require("cors");
const app = express();
const port = appConfig.PORT || 8080;
const { connectToDatabase } = require("./configs/connection");
const passport = require("./configs/passport.config");
const {
  errorConverter,
  errorHandler,
} = require("./middlewares/error.middleware");
const morgan = require("morgan");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const swaggerOptions = require("./configs/swagger.config");

const startServer = async () => {
  try {
    await connectToDatabase();

    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(morgan("dev"));
    app.use(passport.initialize());

    const googleMeetRoutes = require("./routes/meet.route");
    app.use("/api/v1/google-meet", googleMeetRoutes);

    app.get("/", (req, res) => {
      res.send("Hello World!");
    });

    // Swagger setup
    const swaggerSpec = swaggerJSDoc(swaggerOptions);
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    app.use("/api/v1", require("./routes"));
    app.use("*", (req, res) => {
      res.status(404).json({ message: "Not found" });
    });

    app.use(errorConverter);
    app.use(errorHandler);

    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
