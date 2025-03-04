const express = require("express");
const router = express.Router();
const reservationResultController = require("../controllers/reservationResult.controller");
const auth = require("../middlewares/auth.middleware");
router.post(
  "/create-reservation-result",
  auth,
  reservationResultController.createReservationResult
);
router.get(
  "/get-reservation-result/:reservationResultID",
  reservationResultController.getReservationResult
);
router.put(
  "/update-reservation-result/:reservationResultID",
  auth,
  reservationResultController.updateReservationResult
);
router.put(
  "/delete-reservation-result/:reservationResultID",
  auth,
  reservationResultController.deleteReservationResult
);
router.get(
  "/get-all-reservation-result",
  reservationResultController.getAllReservationResult
);
module.exports = router;
