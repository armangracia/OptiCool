// // routes/statusRoutes.js
// const express = require('express');
// const router = express.Router();
// const { Room } = require('../models');

// router.get('/status', async (req, res) => {
//     try {
//         const rooms = await Room.findAll({ attributes: ['id', 'status'] });

//         const statusObj = {};
//         rooms.forEach(room => {
//             statusObj[room.id] = room.status;
//         });

//         res.json(statusObj);
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).json({ message: 'Error fetching statuses' });
//     }
// });

// module.exports = router;
