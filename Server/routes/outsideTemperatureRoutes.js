const express = require("express");
const router = express.Router();
const {
  getAllOutsideTemperature,
  getOutsideTemperatureByRange,
} = require("../controllers/outsideTempControllerr");

router.get("/getoutsideTemperature", getAllOutsideTemperature);

router.get("/range", getOutsideTemperatureByRange);

module.exports = router;
