const express = require("express");
const meetController = require("../controllers/meet.controller");
const { auth } = require("../middlewares/auth.middleware");
const router = express.Router();

// Thêm middleware auth để đảm bảo có user data
router.post("/create-meet", auth, meetController.createMeeting);

module.exports = router;
