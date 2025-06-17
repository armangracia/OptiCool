const express = require("express");
const router = express.Router();
const {
  getAllOutsideTemperature,
  getOutsideTemperatureByRange,
} = require("../controllers/outsideTempController");

router.get("/getoutsideTemperature", getAllOutsideTemperature);

router.get("/range", getOutsideTemperatureByRange);

module.exports = router;
