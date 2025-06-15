const InsideHumidity = require("../models/InsideHumidity");

// Get all inside humidity logs
exports.getAllInsideHumidity = async (req, res) => {
  try {
    const data = await InsideHumidity.find().sort({ timestamp: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get inside humidity logs within date range
exports.getInsideHumidityByRange = async (req, res) => {
  const { start, end } = req.query;
  try {
    const data = await InsideHumidity.find({
      timestamp: {
        $gte: new Date(start),
        $lte: new Date(end),
      },
    }).sort({ timestamp: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch range data", error });
  }
};
