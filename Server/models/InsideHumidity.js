const mongoose = require("mongoose");

const insideHumiditySchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  humidity: Number,
});

const InsideHumidity = mongoose.model("InsideHumidity", insideHumiditySchema);

module.exports = InsideHumidity;

