const express = require("express");
const router = express.Router();
const coupleTherapistController = require("../controllers/coupleTherapist.controller");

router.get("/", coupleTherapistController.getAllCoupleTherapist);
router.get("/:id", coupleTherapistController.getCoupleTherapistById);
router.get(
  "/create-availability",
  coupleTherapistController.createAvailability
);
router.get("/get-availability", coupleTherapistController.getAvailability);
router.get(
  "/update-availability",
  coupleTherapistController.updateAvailability
);
router.get(
  "/delete-availability",
  coupleTherapistController.deleteAvailability
);

module.exports = router;
