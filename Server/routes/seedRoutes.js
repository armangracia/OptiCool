const express = require("express");
const router = express.Router();
// const { seedData } = require("../controllers/seed.controller");
const { seedData } = require("../utils/seed.Controller");

router.post("/", seedData);

module.exports = router;
