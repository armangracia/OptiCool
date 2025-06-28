require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define schemas
const humiditySchema = new mongoose.Schema({
  timestamp: Date,
  humidity: Number,
});

const temperatureSchema = new mongoose.Schema({
  timestamp: Date,
  temperature: Number,
});

const powerSchema = new mongoose.Schema({
  timestamp: Date,
  consumption: Number,
});

// Define models
const InsideHumidity = mongoose.model("InsideHumidity", humiditySchema);
const OutsideHumidity = mongoose.model("OutsideHumidity", humiditySchema);
const InsideTemperature = mongoose.model("InsideTemperature", temperatureSchema);
const OutsideTemperature = mongoose.model("OutsideTemperature", temperatureSchema);
const PowerConsumption = mongoose.model("PowerConsumption", powerSchema);

// Define file paths and upload logic
const jobs = [
  {
    file: "inside_humidity.json",
    model: InsideHumidity,
    transform: ({ timestamp, humidity }) => ({
      timestamp: new Date(timestamp),
      humidity: Number(humidity),
    }),
  },
  {
    file: "outside_humidity.json",
    model: OutsideHumidity,
    transform: ({ timestamp, humidity }) => ({
      timestamp: new Date(timestamp),
      humidity: Number(humidity),
    }),
  },
  {
    file: "inside_temperature.json",
    model: InsideTemperature,
    transform: ({ timestamp, temperature }) => ({
      timestamp: new Date(timestamp),
      temperature: Number(temperature),
    }),
  },
  {
    file: "outside_temperature.json",
    model: OutsideTemperature,
    transform: ({ timestamp, temperature }) => ({
      timestamp: new Date(timestamp),
      temperature: Number(temperature),
    }),
  },
  {
    file: "power_consumption.json",
    model: PowerConsumption,
    transform: ({ timestamp, consumption }) => ({
      timestamp: new Date(timestamp),
      consumption: Number(consumption),
    }),
  },
];

async function uploadAll() {
  for (const { file, model, transform } of jobs) {
    const filePath = path.join(__dirname, "../", file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const docs = JSON.parse(raw).map(transform);
    await model.insertMany(docs);
  }
}

module.exports = uploadAll;
