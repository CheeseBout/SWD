const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin.controller");
const auth = require("../middlewares/auth.middleware");

router.post("/manage-certificate", auth, adminController.manageCertificate);
module.exports = router;
