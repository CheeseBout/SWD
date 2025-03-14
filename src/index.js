require("dotenv").config();
const appConfig = require("./configs/app.config");
const express = require("express");
const cors = require("cors");
const session = require("express-session");
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

    // Add CORS configuration
    const corsOptions = {
      origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        const allowedOrigins = [
          "http://localhost:5173",
          "http://localhost:3000",
          "https://premarital-counseling.vercel.app",
          appConfig.CLIENT_URL,
        ];

        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          console.log("Blocked by CORS:", origin);
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      allowedHeaders: ["Content-Type", "Authorization"],
      exposedHeaders: ["Content-Type", "Authorization"],
    };

    // Apply CORS before other middleware
    app.use(cors(corsOptions));

    // Session middleware configuration
    app.use(
      session({
        secret: process.env.SESSION_SECRET || "your-secret-key",
        resave: true,
        saveUninitialized: true,
        cookie: {
          secure: process.env.NODE_ENV === "production",
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
        },
      })
    );

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(morgan("dev"));

    // Initialize Passport after session middleware
    app.use(passport.initialize());
    app.use(passport.session());

    const googleMeetRoutes = require("./routes/meet.route");
    app.use("/api/v1/google-meet", googleMeetRoutes);

    // Add test routes for debugging
    if (process.env.NODE_ENV !== "production") {
      const testRoutes = require("./routes/test-callback.route");
      app.use("/api/v1/test", testRoutes);
      console.log("Test routes enabled for debugging");
    }

    app.get("/", (req, res) => {
      res.send("Hello World!");
    });

    try {
      // Swagger setup - thêm try-catch để xử lý lỗi
      const swaggerSpec = swaggerJSDoc(swaggerOptions);
      app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    } catch (swaggerError) {
      console.error("Swagger initialization failed:", swaggerError);
      // Tiếp tục khởi động server dù swagger có lỗi
    }

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
