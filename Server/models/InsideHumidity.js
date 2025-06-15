const mongoose = require("mongoose");

const insideHumiditySchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  humidity: Number,
});

module.exports = mongoose.model("InsideHumidity", insideHumiditySchema);
