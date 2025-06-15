const mongoose = require("mongoose");
const fs = require("fs");

// Connect to MongoDB
mongoose.connect("mongodb+srv://angelpagalan:angelpagalan@cluster0.w5pzofs.mongodb.net/Cool?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const humiditySchema = new mongoose.Schema({
  timestamp: Date,
  humidity: Number,
});

const OutsideHumidity = mongoose.model("OutsideHumidity", humiditySchema);

// Read and parse JSON file
const rawData = fs.readFileSync("C:/Users/arman/Capstone/OptiCool/Server/outside_humidity_records.json");
const records = JSON.parse(rawData);

// Convert and insert into MongoDB
const formattedRecords = records.map(entry => ({
  timestamp: new Date(entry.timestamp),
  humidity: parseFloat(entry.humidity),
}));

OutsideHumidity.insertMany(formattedRecords)
  .then(() => {
    console.log("Data inserted successfully!");
    mongoose.connection.close();
  })
  .catch(error => {
    console.error("Error inserting data:", error);
    mongoose.connection.close();
  });
