const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservation.controller");

router.post("/create-reservation", reservationController.createReservation);
router.get("/get-reservation/:id", reservationController.getReservationById);
router.post("/update-reservation/:id", reservationController.updateReservation);
router.put("/delete-reservation/:id", reservationController.deleteReservation);

module.exports = router;
