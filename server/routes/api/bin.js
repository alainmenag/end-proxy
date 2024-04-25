/*
	http://127.0.0.1:8715/_bec15128-c98d-4a64-a77c-523ad6d034a7
*/

const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const chokidar = require('chokidar');
const { exec, execSync } = require('child_process');

const emitter = require('../../emitter');

const api = {
};

// get all scenes
router.use([
	'/_:id',
	'/_:id/*'
], (async function(req, res) // /api/screenshot
{
	let payload = {
		uuid: uuidv4(),
		ts: Date.now(),
		transport: 'http',
		action: 'request',
		method: req.method,
		path: req._parsedUrl.path,
		pathname: req._parsedUrl.pathname,
		search: req._parsedUrl.search,
		headers: req.headers,
		query: req.query,
		params: req.params,
		body: req.body
	};
	
	if (req.headers.accept && req.headers.accept.indexOf('text/html') > -1)
	{
		return res.render('api/bin', payload);
	}

	emitter.emit('request', payload);

	res.send(payload);
}));

router.use([
	'/_*',
], (async function(req, res) // /api/screenshot
{
	res.redirect(307, `/_${ uuidv4() }`);
}));

module.exports = router;
