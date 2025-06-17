const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require("morgan");
const fs = require('fs');

// Middleware setup
app.use(cors());
app.options("*", cors());
app.use(express.json({ limit: '50mb' })); // Adjust size as needed
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('tiny'));

// Routes
const userRoutes = require('./routes/userRoutes');
const ereportRoutes = require('./routes/ereportRoutes');
const postRoutes = require('./routes/postRoutes');
const powerConsumptionRoutes = require('./routes/powerConsumptionRoutes'); // Import power consumption routes
// const roomRoutes = require('./routes/roomRoutes');
// const statusRoutes = require('./routes/statusRoutes');
const insideHumidityRoutes = require("./routes/insideHumidityRoutes");
const outsideHumidityRoutes = require("./routes/outsideHumidityRoutes");
const insideTemperatureRoutes = require("./routes/insideTemperatureRoutes");
const outsideTemperatureRoutes = require("./routes/outsideTemperatureRoutes");


// app.use('/', statusRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/ereports', ereportRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/power-consumption', powerConsumptionRoutes);
// app.use('/api/v1/room', roomRoutes);
app.use("/api/v1/inside-humidity", insideHumidityRoutes);
app.use("/api/v1/outside-humidity", outsideHumidityRoutes);
app.use("/api/v1/inside-temperature", insideTemperatureRoutes);
app.use("/api/v1/outside-temperature", outsideTemperatureRoutes);

app.post('/api/v1/save/data', async (req, res) => {
    const jsonData = JSON.stringify(req.body.power, null, 2);

    // Write to a file
    fs.writeFileSync('power_consumption.json', jsonData, 'utf8');

    res.json({
        message: "write success",
    });
});

module.exports = app;
