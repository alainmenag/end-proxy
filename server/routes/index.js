
console.log('SERVER:\t', Date.now());

const { v4: uuidv4 } = require('uuid');
const path = require('path');
const http = require('http');
const express = require('express');
const app = express();
const socketIO = require('socket.io');
const expressListRoutes = require('express-list-routes');
const expressListEndpoints = require('express-list-endpoints');

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

api.parseRegex = (str) =>
{
	return str.split('/^')
		.pop()
		.replace(/\\/g, '')
		.split(':^').pop()
		.split('?(?')[0]
		.split('(?:([^/]+?))').join(':param') // hold param places
		.replace('?$/i', '')
		.replace(/\(\.\*\)/g, '*') // make wildcard easy to read
		.toString();
};

api.formatMethods = (obj) =>
{
	return Object.keys(obj || {}).join(',').toUpperCase().split(',');
};

api.getRoutes = (app) =>
{
	const stack = (app && app.stack) || (app && app._router && app._router.stack);
	let _cache = require('module')._cache;
	let routes = [];

	if (!stack) return routes;

	let locate = (layer) =>
	{
		for (const ck in _cache)
		{
			if (!_cache[ck].exports.stack) continue;
			
			if (_cache[ck].exports.stack.indexOf(layer) > -1)
			{
				return ck.replace(process.env.PWD, '');
			}
		}

		return null;
	};

	let getPath = (layer, method, pathname) =>
	{
		for (p of layer.regexp.toString().split('|^')) // multi-path routes
		{
			let route = ((pathname || '') + api.parseRegex(p).substr(pathname ? 1 : 0))

			// fill params with names
			for (key of layer.keys) route = route.replace(':param', ':' + key.name);

			if (!layer.handle.stack && !layer.route)
			{
				route = route.slice(0, -1) || '/';
				
				routes.push({
					name: layer.name,
					path: route,
					methods: ['*'],
					code: layer.handle.toString(),
					file: locate(layer),
				});

				continue; // if it's middleware
			}

			if (layer.route)
			{
				routes.push({
					name: layer.name,
					path: route.slice(0, -1) || '/',
					methods: api.formatMethods(layer.route.methods),
					code: layer.route.stack[0].handle.toString(),
					file: locate(layer),
				});

				continue;
			}

			if (layer.handle.stack)
			{
				for (l of layer.handle.stack)
				{
					getPath(l, null, route);
				}

				continue;
			}
		}
	};

	// start looking thru paths/layers
	for (layer of stack) getPath(layer);

	return routes;
};

api.server = http.createServer(app).listen(api.port, api.host, function(e)
{
	console.log('HTTP:\t', api.url);

	let rts = api.getRoutes(app);

	for (let route of rts)
	{
		console.log(route.methods, [route.path], `(${ route.file })`);

		//`(${ route.name })`, route.file
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
