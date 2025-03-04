const express = require("express");
const router = express.Router();
const coupleTherapistController = require("../controllers/coupleTherapist.controller");
const { checkCertificate, auth } = require("../middlewares/auth.middleware");

router.get("/", coupleTherapistController.getAllCoupleTherapist);
router.get(
  "/:coupleTherapistId",
  coupleTherapistController.getCoupleTherapistById
);
router.post(
  "/create-availability",
  auth,
  checkCertificate,
  coupleTherapistController.createAvailability
);
router.get("/get-availability", coupleTherapistController.getAvailabilityById);
router.put(
  "/update-availability/:availabilityID",
  auth,
  checkCertificate,
  coupleTherapistController.updateAvailability
);
router.put(
  "/delete-availability/:availabilityID",
  auth,
  checkCertificate,
  coupleTherapistController.deleteAvailability
);

module.exports = router;
