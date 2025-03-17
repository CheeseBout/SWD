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
  // Log the error for debugging
  console.error("ERROR DETAILS:", {
    originalUrl: req.originalUrl,
    method: req.method,
    statusCode: err.statusCode || err.status,
    message: err.message,
    stack: err.stack,
    name: err.name,
    isOperational: err.isOperational,
  });

  // Ensure a valid status code is set (fallback to 500 if none)
  const statusCode = err.statusCode || err.status || 500;

  // Prepare the response
  let response = {
    status: "error",
    message: err.message || "Internal Server Error",
  };

  // Add stack trace in development
  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  // Send the response
  res.status(statusCode).json(response);
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
