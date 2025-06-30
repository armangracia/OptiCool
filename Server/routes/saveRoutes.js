// const express = require('express');
// const router = express.Router();

// const PowerConsumption = require('../models/PowerConsumption');
// const InsideHumidity = require('../models/InsideHumidity');
// const OutsideHumidity = require('../models/OutsideHumidity');
// const InsideTemperature = require('../models/InsideTemperature');
// const OutsideTemperature = require('../models/OutsideTemperature');

// // Save Power Data
// router.post('/data', async (req, res) => {
//   try {
//     await PowerConsumption.insertMany(req.body.power);
//     res.json({ message: "Power data saved to MongoDB" });
//   } catch (error) {
//     console.error("Error saving power data:", error);
//     res.status(500).json({ message: "Failed to save power data", error: error.message });
//   }
// });

// // Inside Humidity
// router.post('/inside-humidity', async (req, res) => {
//   try {
//     await InsideHumidity.insertMany(req.body.insideHumidity);
//     res.json({ message: "Inside humidity data saved to MongoDB" });
//   } catch (error) {
//     console.error("Error saving inside humidity:", error);
//     res.status(500).json({ message: "Failed to save inside humidity", error: error.message });
//   }
// });

// // Outside Humidity
// router.post('/outside-humidity', async (req, res) => {
//   try {
//     await OutsideHumidity.insertMany(req.body.outsideHumidity);
//     res.json({ message: "Outside humidity data saved to MongoDB" });
//   } catch (error) {
//     console.error("Error saving outside humidity:", error);
//     res.status(500).json({ message: "Failed to save outside humidity", error: error.message });
//   }
// });

// // Inside Temperature
// router.post('/inside-temperature', async (req, res) => {
//   try {
//     await InsideTemperature.insertMany(req.body.insideTemperature);
//     res.json({ message: "Inside temperature data saved to MongoDB" });
//   } catch (error) {
//     console.error("Error saving inside temperature:", error);
//     res.status(500).json({ message: "Failed to save inside temperature", error: error.message });
//   }
// });

// // Outside Temperature
// router.post('/outside-temperature', async (req, res) => {
//   try {
//     await OutsideTemperature.insertMany(req.body.outsideTemperature);
//     res.json({ message: "Outside temperature data saved to MongoDB" });
//   } catch (error) {
//     console.error("Error saving outside temperature:", error);
//     res.status(500).json({ message: "Failed to save outside temperature", error: error.message });
//   }
// });

// module.exports = router;
