const InsideTemperature = require("../models/InsideTemperature");

const getAllInsideTemperature = async (req, res) => {
  try {
    const data = await InsideTemperature.find().sort({ timestamp: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const getInsideTemperatureByRange = async (req, res) => {
  const { start, end } = req.query;
  try {
    const data = await InsideTemperature.find({
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

module.exports = {
  getAllInsideTemperature,
  getInsideTemperatureByRange,
};
