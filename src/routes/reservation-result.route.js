const express = require("express");
const router = express.Router();
const reservationResultController = require("../controllers/reservationResult.controller");
router.post(
  "/create-reservation-result",
  reservationResultController.createReservationResult
);
router.get(
  "/get-reservation-result/:reservationResultID",
  reservationResultController.getReservationResult
);
router.put(
  "/update-reservation-result/:reservationResultID",
  reservationResultController.updateReservationResult
);
router.put(
  "/delete-reservation-result/:reservationResultID",
  reservationResultController.deleteReservationResult
);
router.get(
  "/get-all-reservation-result",
  reservationResultController.getAllReservationResult
);
module.exports = router;
