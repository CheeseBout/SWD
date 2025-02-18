const express = require("express");
const router = express.Router();
const reservationResultController = require("../controllers/reservationResult.controller");
router.post(
  "create-reservation-result",
  reservationResultController.createReservationResult
);
router.get(
  "get-reservation-result",
  reservationResultController.getAllReservationResult
);
router.post(
  "update-reservation-result",
  reservationResultController.updateReservationResult
);
router.post(
  "delete-reservation-result",
  reservationResultController.deleteReservationResult
);
router.get("/", reservationResultController.getAllReservationResult);
module.exports = router;
