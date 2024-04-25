
const router = require('express').Router();
const fs = require('fs');
const chokidar = require('chokidar');
const { exec, execSync } = require('child_process');

const api = {
	home: process.env.HOME || process.env.USERPROFILE,
	source: process.env.SCREENSHOT_SOURCE,
	destination: process.env.SCREENSHOT_DESTINATION,
};

//api.source = `${ api.home }/Desktop`;
//api.destination = `${ api.home }/Documents/Screenshots`;

api.move = async (path) =>
{
	let allowed = false;

	if (path.indexOf(`${ api.source }/${ process.env.SCREENSHOT_WATCH }`) === 0) allowed = true;
	if (path.indexOf(`${ api.source }/Screen*`) === 0) allowed = true;
	if (path.indexOf(`${ api.source }/Screenshot`) === 0) allowed = true;
	if (path.indexOf(`${ api.source }/Screen Shot`) === 0) allowed = true;
	if (path.indexOf(`${ api.source }/Screen shot`) === 0) allowed = true;

	if (!allowed) return;

	let newPath = `${ api.destination }/${ path.split('/').pop() }`;
	let cmd = `mv ${ path } ${ api.destination }`;
	let moved = null; try {
		moved = path.indexOf('*') > -1 ? (await execSync(cmd, {
			stdio: ['ignore', 'ignore', 'ignore']
		})) : (fs.renameSync(path, newPath));
	} catch(err) {};
};

 // run on startup
if (process.env.SCREENSHOT_INITIAL) api.move(`${ api.source }/${ process.env.SCREENSHOT_INITIAL }`);

// One-liner for current directory
if (process.env.SCREENSHOT_WATCH) chokidar.watch(api.source,
{
	ignoreInitial: true,
})
.on('add', (path, event) =>
{
	api.move(path);
});

// get all scenes
router.get('/cleanup', (async function(req, res) // /api/screenshot
{
	let moved = await api.move(`${ api.source }/Screen*`);

	res.send({});
}));

module.exports = router;
