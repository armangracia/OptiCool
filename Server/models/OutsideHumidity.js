const mongoose = require("mongoose");

const outsideHumiditySchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  humidity: Number,
});

const OutsideHumidity = mongoose.model("OutsideHumidity", outsideHumiditySchema);

module.exports = OutsideHumidity;

