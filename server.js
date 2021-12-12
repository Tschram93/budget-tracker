const compression = require('compression');
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
mongoose
	.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/budget', {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.catch((error) => console.log(error));

// Include route
app.use(require(route));

app.listen(PORT, () => {
	console.log(`App running on localhost:${PORT}!`);
});
