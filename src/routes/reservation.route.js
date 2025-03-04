const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservation.controller");
const auth = require("../middlewares/auth.middleware");

router.post(
  "/create-reservation",
  auth,
  reservationController.createReservation
);
router.get("/get-all-reservation", reservationController.getAllReservation);
router.get(
  "/get-reservation/:reservationID",
  reservationController.getReservationById
);
router.put(
  "/update-reservation/:reservationID",
  auth,
  reservationController.updateReservation
);
router.put(
  "/delete-reservation/:reservationID",
  auth,
  reservationController.deleteReservation
);
router.put(
  "/approve-reservation/:reservationID",
  auth,
  reservationController.approveReservation
);
router.put(
  "/deny-reservation/:reservationID",
  auth,
  reservationController.denyReservation
);

module.exports = router;
