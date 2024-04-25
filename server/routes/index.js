
console.log('***** SERVER:\t', Date.now());

const express = require('express');
const app = express();

const api = {
	host: process.env.SERVER_HOST || '127.0.0.1',
	port: process.env.SERVER_PORT || 8715,
};

api.url = `http://${ api.host }:${ api.port }`;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/obs', require('./api/obs'));
app.use('/api/litra', require('./api/litra'));
app.use('/api/screenshot', require('./api/screenshot'));

app.getRoutes = () =>
{
	let routes = [];

	for (route of app._router.stack)
	{
		if (!route.handle.stack) continue;
	
		let regex = route.regexp.toString();
		let path = decodeURIComponent(regex).match(/^\/(.+?)\/?(?=\(|$)/).pop().replace(/^\^/, '').replace(/\\/g, '').replace('/?', '');
	
		for (layer of route.handle.stack) routes.push({
			url: api.url + path + (layer?.route?.path || ''),
			path: path + (layer?.route?.path || ''),
			methods: Object.keys(layer?.route?.methods || {}).join(',').toUpperCase().split(',')
		})
	}

	return routes;
};

app.listen(api.port, api.host, () =>
{
	console.log('***** HTTP:\t', api.url);

	for ({ url, path, methods } of app.getRoutes())
	{
		console.log('***** HTTP:\t', url, methods);
	}
});

module.exports = app;
