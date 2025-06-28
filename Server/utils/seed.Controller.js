const uploadAll = require("../uploadToDbase");

exports.seedData = async (req, res) => {
  try {
    await uploadAll();
    res.status(200).json({ message: "✅ Data uploaded successfully." });
  } catch (err) {
    console.error("❌ Upload failed:", err.message);
    res.status(500).json({ error: err.message });
  }
};
