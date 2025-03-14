const mongoose = require("mongoose");
const config = require("../configs/app.config");
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
  let { statusCode, message } = err;

  // Set status code
  statusCode = statusCode || httpStatus.INTERNAL_SERVER_ERROR;

  // Response with error details
  res.status(statusCode).json({
    code: statusCode,
    message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      details: err.errors || err.details || undefined,
    }),
  });
};

module.exports = {
  errorConverter,
  errorHandler,
};
