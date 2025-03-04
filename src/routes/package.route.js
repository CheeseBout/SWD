const express = require("express");
const router = express.Router();
const packageController = require("../controllers/package.controller");
const auth = require("../middlewares/auth.middleware");

router.post("/create-package", auth, packageController.createPackage);
router.get("/get-all-package", packageController.getAllPackage);
router.get("/get-package/:packageID", packageController.getPackageByID);
router.put("/update-package/:packageID", auth, packageController.updatePackage);
router.put("/delete-package/:packageID", auth, packageController.deletePackage);

module.exports = router;
