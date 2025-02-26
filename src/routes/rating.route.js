const express = require("express");
const router = express.Router();
const ratingController = require("../controllers/rating.controller");

router.post("/create-rating", ratingController.createRating);
router.get("/get-all-rating", ratingController.getAllRating);
router.get("/get-rating/:ratingID", ratingController.getRatingById);
router.put("/update-rating/:ratingID", ratingController.updateRating);
router.put("/delete-rating/:ratingID", ratingController.deleteRating);

module.exports = router;
