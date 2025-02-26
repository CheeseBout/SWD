const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservation.controller");

router.post("/create-reservation", reservationController.createReservation);
router.get("/get-all-reservation", reservationController.getAllReservation);
router.get(
  "/get-reservation/:reservationID",
  reservationController.getReservationById
);
router.put(
  "/update-reservation/:reservationID",
  reservationController.updateReservation
);
router.put(
  "/delete-reservation/:reservationID",
  reservationController.deleteReservation
);
router.put(
  "/approve-reservation/:reservationID",
  reservationController.approveReservation
);
router.put(
  "/deny-reservation/:reservationID",
  reservationController.denyReservation
);

module.exports = router;
