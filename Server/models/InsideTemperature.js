const mongoose = require("mongoose");

const insideTemperatureSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  temperature: Number,
});

const InsideTemperature = mongoose.model("InsideTemperature", insideTemperatureSchema);

module.exports = InsideTemperature;

