const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect("mongodb+srv://angelpagalan:angelpagalan@cluster0.w5pzofs.mongodb.net/Cool", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define schema
const RoomStatusSchema = new mongoose.Schema({
  id: String,
  status: String,
});

// Create model
const RoomStatus = mongoose.model("RoomStatus", RoomStatusSchema);

// Define your seed data
const roomStatuses = [
  { id: "room1", status: "online" },
  { id: "room2", status: "offline" },
  { id: "room3", status: "online" },
  { id: "room4", status: "offline" },
];

// Insert data into MongoDB
RoomStatus.insertMany(roomStatuses)
  .then(() => {
    console.log("✅ Room statuses inserted successfully!");
    mongoose.connection.close();
  })
  .catch((err) => console.error("❌ Error inserting room statuses:", err));
