const mongoose = require("mongoose");
const httpStatus = require("http-status");
const APIError = require("../utils/ApiError");

const errorConverter = (err, req, res, next) => {
  // Log detailed error information
  console.error("ERROR DETAILS:", {
    originalUrl: req.originalUrl,
    method: req.method,
    statusCode: err.statusCode || err.status,
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    name: err.name,
    isOperational: err.isOperational,
  });

  let error = err;
  if (!(error instanceof APIError)) {
    const statusCode =
      error.statusCode || error.status || httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new APIError(statusCode, message, false, err.stack);
  }
  next(error);
};

const errorHandler = (err, req, res, next) => {
  try {
    let { statusCode, message } = err;

    // Ensure statusCode is a valid HTTP status code
    statusCode =
      statusCode &&
      Number.isInteger(statusCode) &&
      statusCode >= 100 &&
      statusCode < 600
        ? statusCode
        : httpStatus.INTERNAL_SERVER_ERROR;

    // Ensure message is a string
    if (typeof message !== "string") {
      message = "Internal Server Error";
    }

    // Set a default response object
    const response = {
      code: statusCode,
      message,
    };

    // Add developer details in development mode
    if (process.env.NODE_ENV === "development") {
      response.stack = err.stack;
      response.details = err.errors || err.details || undefined;
    }

    // Send response
    res.status(statusCode).json(response);
  } catch (handlerError) {
    // Last resort error handler to prevent application crash
    console.error("Error in the error handler itself:", handlerError);
    res.status(500).json({
      code: 500,
      message: "Internal server error occurred while processing the error",
    });
  }
};

// Thêm một error handler toàn cục cho những lỗi không xử lý được
process.on("uncaughtException", (error) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down gracefully...");
  console.error(error.name, error.message, error.stack);
  // Thay vì tắt server ngay lập tức, cho phép các kết nối hiện tại hoàn thành
  // và chỉ tắt server sau một khoảng thời gian
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

process.on("unhandledRejection", (error) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down gracefully...");
  console.error(error.name, error.message, error.stack);
  // Thay vì tắt server ngay lập tức, cho phép các kết nối hiện tại hoàn thành
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

module.exports = {
  errorConverter,
  errorHandler,
};
