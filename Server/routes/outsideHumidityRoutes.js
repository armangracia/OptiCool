const express = require("express");
const router = express.Router();
const {
  getAllOutsideHumidity,
  getOutsideHumidityByRange,
} = require("../controllers/outsideHumidityController");

router.get("/getoutsideHumidity", getAllOutsideHumidity);

router.get("/range", getOutsideHumidityByRange);

module.exports = router;
