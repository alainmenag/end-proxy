
require('dotenv').config({ path: __dirname + '/../.env' });

const litra = require('litra');
const express = require('express');
const app = express();
const routes = require('./routes');

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(routes);

app.listen(8715, () => {
	console.log('*****', 'http://localhost:8715/')
});
