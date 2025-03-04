const express = require("express");
const router = express.Router();
const ratingController = require("../controllers/rating.controller");
const auth = require("../middlewares/auth.middleware");

router.post("/create-rating", auth, ratingController.createRating);
router.get("/get-all-rating", ratingController.getAllRating);
router.get("/get-rating/:ratingID", ratingController.getRatingById);
router.put("/update-rating/:ratingID", auth, ratingController.updateRating);
router.put("/delete-rating/:ratingID", auth, ratingController.deleteRating);

module.exports = router;
