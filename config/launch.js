require('dotenv').config()
const mongoose = require('mongoose');
const launch = mongoose.connect(process.env.MONGODB_URI);

module.exports = launch