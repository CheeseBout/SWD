const express = require("express");
const router = express.Router();
const coupleTherapistController = require("../controllers/coupleTherapist.controller");

router.get(
  "/get-all-therapist",
  coupleTherapistController.getAllCoupleTherapist
);
router.get(
  "/:coupleTherapistId",
  coupleTherapistController.getCoupleTherapistById
);
router.post(
  "/create-availability",
  coupleTherapistController.createAvailability
);
router.get("/get-availability", coupleTherapistController.getAvailabilityById);
router.put(
  "/update-availability/:availabilityID",
  coupleTherapistController.updateAvailability
);
router.put(
  "/delete-availability/:availabilityID",
  coupleTherapistController.deleteAvailability
);

module.exports = router;
