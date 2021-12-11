const express = require('express');
const logger = require('morgan');
const mongoose = require('mongoose');
const path = require('path');
const route = './routes/api.js';
const app = express();

const PORT = process.env.PORT || 3000;

app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('public'));

// include mongoose here when set up
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/3000', {
	useNewUrlParser: true,
	useFindAndModify: false,
});

// Include route
app.use(require(route));

app.listen(PORT, () => {
	console.log(`App running on localhost:${PORT}!`);
});
