const mongoose = require("mongoose");

const outsideTemperatureSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  temperature: Number,
});

const OutsideTemperature = mongoose.model("OutsideTemperature", outsideTemperatureSchema);

module.exports = OutsideTemperature;

