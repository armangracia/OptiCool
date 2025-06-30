// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const morgan = require("morgan");

// const app = express();

// // Middleware setup
// app.use(cors());
// app.options("*", cors());
// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ extended: true, limit: "50mb" }));
// app.use(morgan("tiny"));

// // ✅ Connect to MongoDB (no deprecated options)
// mongoose
//   .connect("mongodb+srv://angelpagalan:angelpagalan@cluster0.w5pzofs.mongodb.net/Cool")
//   .then(() => console.log("✅ MongoDB connected"))
//   .catch((err) => console.error("❌ MongoDB connection error:", err));

// // ✅ Route imports
// const userRoutes = require("./routes/userRoutes");
// const ereportRoutes = require("./routes/ereportRoutes");
// const postRoutes = require("./routes/postRoutes");
// const powerConsumptionRoutes = require("./routes/powerConsumptionRoutes");
// const insideHumidityRoutes = require("./routes/insideHumidityRoutes");
// const outsideHumidityRoutes = require("./routes/outsideHumidityRoutes");
// const insideTemperatureRoutes = require("./routes/insideTemperatureRoutes");
// const outsideTemperatureRoutes = require("./routes/outsideTemperatureRoutes");
// const activityLogRoutes = require("./routes/activityLogRoutes");
// const seedRoutes = require("./routes/seedRoutes");
// const saveRoutes = require("./routes/saveRoutes"); // ✅ For extracted data

// // ✅ Use routes
// app.use("/api/v1/users", userRoutes);
// app.use("/api/v1/activity-log", activityLogRoutes);
// app.use("/api/v1/ereports", ereportRoutes);
// app.use("/api/v1/posts", postRoutes);
// app.use("/api/v1/power-consumption", powerConsumptionRoutes);
// app.use("/api/v1/inside-humidity", insideHumidityRoutes);
// app.use("/api/v1/outside-humidity", outsideHumidityRoutes);
// app.use("/api/v1/inside-temperature", insideTemperatureRoutes);
// app.use("/api/v1/outside-temperature", outsideTemperatureRoutes);
// app.use("/api/v1/seed", seedRoutes);
// app.use("/api/v1/save", saveRoutes); // ✅ Handles: /save/data, /save/inside-humidity, etc.

// // ✅ Start server
// const PORT = process.env.PORT; // 🔒 No fallback to 4000
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });

// module.exports = app;






const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const fs = require("fs");

// Middleware setup
app.use(cors());
app.options("*", cors());
app.use(express.json({ limit: "50mb" })); // Adjust size as needed
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(morgan("tiny"));

// Routes
const userRoutes = require("./routes/userRoutes");
const ereportRoutes = require("./routes/ereportRoutes");
const postRoutes = require("./routes/postRoutes");
const powerConsumptionRoutes = require("./routes/powerConsumptionRoutes"); // Import power consumption routes
// const roomRoutes = require('./routes/roomRoutes');
// const statusRoutes = require('./routes/statusRoutes');
const insideHumidityRoutes = require("./routes/insideHumidityRoutes");
const outsideHumidityRoutes = require("./routes/outsideHumidityRoutes");
const insideTemperatureRoutes = require("./routes/insideTemperatureRoutes");
const outsideTemperatureRoutes = require("./routes/outsideTemperatureRoutes");
const activityLogRoutes = require("./routes/activityLogRoutes");
const seedRoutes = require("./routes/seedRoutes");

// app.use('/', statusRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/activity-log", activityLogRoutes);
app.use("/api/v1/ereports", ereportRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/power-consumption", powerConsumptionRoutes);
// app.use('/api/v1/room', roomRoutes);
app.use("/api/v1/inside-humidity", insideHumidityRoutes);
app.use("/api/v1/outside-humidity", outsideHumidityRoutes);
app.use("/api/v1/inside-temperature", insideTemperatureRoutes);
app.use("/api/v1/outside-temperature", outsideTemperatureRoutes);
app.use("/api/v1/seed", seedRoutes);

app.post("/api/v1/save/data", async (req, res) => {
  const jsonData = JSON.stringify(req.body.power, null, 2);

  // Write to a file
  fs.writeFileSync("power_consumption.json", jsonData, "utf8");

  res.json({
    message: "write success",
  });
});

app.post("/api/v1/save/inside-humidity", async (req, res) => {
  try {
    const jsonData = JSON.stringify(req.body.insideHumidity, null, 2);

    // Write to a file
    fs.writeFileSync("inside_humidity.json", jsonData, "utf8");

    res.json({
      message: "Inside humidity data saved successfully",
    });
  } catch (error) {
    console.error("Error saving inside humidity data:", error);
    res.status(500).json({
      message: "Failed to save inside humidity data",
      error: error.message,
    });
  }
});

app.post("/api/v1/save/outside-humidity", async (req, res) => {
  try {
    const jsonData = JSON.stringify(req.body.outsideHumidity, null, 2);
    fs.writeFileSync("outside_humidity.json", jsonData, "utf8");
    res.json({ message: "Outside humidity data saved successfully" });
  } catch (error) {
    console.error("Error saving outside humidity data:", error);
    res
      .status(500)
      .json({
        message: "Failed to save outside humidity data",
        error: error.message,
      });
  }
});

app.post("/api/v1/save/inside-temperature", async (req, res) => {
  try {
    const jsonData = JSON.stringify(req.body.insideTemperature, null, 2);
    fs.writeFileSync("inside_temperature.json", jsonData, "utf8");
    res.json({ message: "Inside temperature data saved successfully" });
  } catch (error) {
    console.error("Error saving inside temperature data:", error);
    res.status(500).json({
      message: "Failed to save inside temperature data",
      error: error.message,
    });
  }
});

app.post("/api/v1/save/outside-temperature", async (req, res) => {
  try {
    const jsonData = JSON.stringify(req.body.outsideTemperature, null, 2);
    fs.writeFileSync("outside_temperature.json", jsonData, "utf8");
    res.json({ message: "Outside temperature data saved successfully" });
  } catch (error) {
    console.error("Error saving outside temperature data:", error);
    res.status(500).json({
      message: "Failed to save outside temperature data",
      error: error.message,
    });
  }
});

module.exports = app;
