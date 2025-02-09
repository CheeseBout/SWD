const mongoose = require("mongoose");
const appConfig = require("../configs/app.config");

async function connectDB() {
  try {
    await mongoose.connect(appConfig.DB_URL);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
  }
}

module.exports = connectDB;
