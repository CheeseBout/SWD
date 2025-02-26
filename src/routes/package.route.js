const express = require("express");
const router = express.Router();
const packageController = require("../controllers/package.controller");

router.post("/create-package", packageController.createPackage);
router.get("/get-all-package", packageController.getAllPackage);
router.get("/get-package/:packageID", packageController.getPackageByID);
router.put("/update-package/:packageID");
router.put("/delete-package/:packageID");

module.exports = router;
