const express = require("express");
const router = express.Router();
const {
  getAllInsideHumidity,
  getInsideHumidityByRange,
} = require("../controllers/insideHumidityController");

// Route: GET /inside-humidity/
router.get("/", getAllInsideHumidity);

// Route: GET /inside-humidity/range
router.get("/range", getInsideHumidityByRange);

module.exports = router;
