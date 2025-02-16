const express = require("express");
const router = express.Router();
const coupleTherapistController = require("../controllers/coupleTherapist.controller");

router.get("/", coupleTherapistController.getAllCoupleTherapist);
router.get("/:id", coupleTherapistController.getCoupleTherapistById);
router.post(
  "/create-availability",
  coupleTherapistController.createAvailability
);
router.get("/get-availability", coupleTherapistController.getAvailability);
router.post(
  "/update-availability",
  coupleTherapistController.updateAvailability
);
router.post(
  "/delete-availability",
  coupleTherapistController.deleteAvailability
);

module.exports = router;
