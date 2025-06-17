const express = require("express");
const router = express.Router();
const {
  getAllInsideTemperature,
  getInsideTemperatureByRange,
} = require("../controllers/insideTemperatureController");

router.get("/getinsideTemperature", getAllInsideTemperature);

router.get("/range", getInsideTemperatureByRange);

module.exports = router;
