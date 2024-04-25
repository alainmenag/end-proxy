
console.log('SERVER:\t', Date.now());

const { v4: uuidv4 } = require('uuid');
const path = require('path');
const http = require('http');
const express = require('express');
const app = express();
const socketIO = require('socket.io');

const emitter = require('../emitter');

const api = {
	host: process.env.SERVER_HOST || '127.0.0.1',
	port: process.env.SERVER_PORT || 8715,
};

api.url = `http://${ api.host }:${ api.port }`;

app.set('views', path.join(__dirname, '../routes'));
app.set('view engine', 'ejs');

app.use(express.static('public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use([ '/', '/api/bin' ], require('./api/bin'));

app.use('/api/obs', require('./api/obs'));
app.use('/api/litra', require('./api/litra'));
app.use('/api/screenshot', require('./api/screenshot'));

api.getRoutes = () =>
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

api.server = http.createServer(app).listen(api.port, api.host, function(e)
{
	console.log('HTTP:\t', api.url);

	for (let { url, methods } of api.getRoutes())
	{
		console.log('HTTP:\t', url, methods);
	}
});

api.io = socketIO(api.server, {
    allowEIO3: true,
    //cors: { origin: "*" },
    transports: ['websocket'] // Set WebSocket as the preferred transport
});

api.io.on('connection', (socket) =>
{
	console.log('Socket:\t', 'CONNECTED:', socket.id);

	socket.join(socket.handshake.query.id); // join the room

	api.io.to(socket.handshake.query.id).emit('data', {
		uuid: uuidv4(),
		ts: Date.now(),
		action: 'connected',
		transport: socket.handshake.query.transport || 'websocket',
		method: 'GET',
		path: socket.handshake.url,
		headers: socket.handshake.headers,
		query: socket.handshake.query,
	});

    socket.on('disconnect', function ()
    {
		console.log('Socket:\t', 'DISCONNECTED:', socket.id);

		emitter.emit('request', {
			ts: Date.now(),
			action: 'disconnected',
			transport: socket.handshake.query.transport || 'websocket',
			method: 'GET',
			path: socket.handshake.url,
			headers: socket.handshake.headers,
			query: socket.handshake.query,
		});
	});
});

emitter.on('request', (data) =>
{
	let id = (data && data?.params?.id) || (data && data?.query?.id);

	if (id) api.io.to(id).emit('data', data);
});

module.exports = app;
