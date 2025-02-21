const express = require("express");
const meetController = require("../controllers/meet.controller");
const router = express.Router();

router.post("/create-meet", meetController.createMeeting);

module.exports = router;
