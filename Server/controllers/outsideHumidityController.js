const OutsideHumidity = require("../models/OutsideHumidity");

exports.getAllOutsideHumidity = async (req, res) => {
  try {
    const data = await OutsideHumidity.find().sort({ timestamp: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.getOutsideHumidityByRange = async (req, res) => {
  const { start, end } = req.query;
  try {
    const data = await OutsideHumidity.find({
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
