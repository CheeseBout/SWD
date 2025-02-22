const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin.controller");
const auth = require("../middlewares/auth.middleware");

router.post("/approve-certificate", auth, adminController.approveCertificate);

module.exports = router;
