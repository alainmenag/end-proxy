
//https://github.com/timrogers/litra

/*
litra devices

- Litra Glow (2348FE001AH8): Off 🌑
  - Brightness: 73 lm
    - Minimum: 20 lm
    - Maximum: 250 lm
  - Temperature: 3400 K
    - Minimum: 2700 K
    - Maximum: 6500 K
- Litra Beam (2345FE600KC8): Off 🌑
  - Brightness: 400 lm
    - Minimum: 30 lm
    - Maximum: 400 lm
  - Temperature: 5000 K
    - Minimum: 2700 K
    - Maximum: 6500 K

litra on -s 2348FE001AH8
litra off -s 2348FE001AH8

litra on -s 2345FE600KC8
litra off -s 2345FE600KC8
*/

const { exec, execSync } = require('child_process');
const router = require('express').Router();
const devices = {};
const deviceList = async function()
{
	return (await execSync('litra devices')).toString().split('K\n- ').map((d) =>
	{
		const [dTitle, dBrightness, dTemperature] = d.split('\n  - ');

		let device = {
			id: dTitle.match(/\((.*?)\)/)[1],
			name: dTitle.split(' (')[0],
			state: dTitle.split('): ').pop().split(' ')[0],
			brightness: {
				current: parseInt(dBrightness.split('Brightness: ').pop().split(' ')[0]),
				min: parseInt(dBrightness.split('Minimum: ').pop().split(' ')[0]),
				max: parseInt(dBrightness.split('Maximum: ').pop().split(' ')[0])
			},
			temperature: {
				current: parseInt(dTemperature.split('Temperature: ').pop().split(' ')[0]),
				min: parseInt(dTemperature.split('Minimum: ').pop().split(' ')[0]),
				max: parseInt(dTemperature.split('Maximum: ').pop().split(' ')[0])
			}
		};

		if (device.name.indexOf('- ') === 0) device.name = device.name.substr(2);
	
		return device;
	});
};

router.get('/', (async function(req, res)
{
	let { id } = req.params;
	let devices = await deviceList();

	res.send(devices);
}));

router.get('/:id', (async function(req, res)
{
	let { id } = req.params;
	let devices = await deviceList();
	let device = devices.filter((d) => {
		return d.id == id;
	})[0];

	res.send(device);
}));

router.post('/dial/:id', (async function(req, res)
{
	let { id } = req.params;
	let devices = await deviceList();
	let device = devices.filter((d) => {
		return d.id == id;
	})[0];

	if (!device) return res.end();

	let state = null;
	let value = device.brightness.current + (req.body.amount < 0 ? -50 : 50);

	if (value == 0) state = 'Off';
	if (value > 0) state = 'On';

	if (value < device.brightness.min) value = device.brightness.min;
	if (value > device.brightness.max) value = device.brightness.max;

	let cmd = `litra brightness -v ${ value } -s ${ id }`;

	if (state == 'Off') cmd = `litra off -s ${ id }`;
	if (device.state == 'Off' && state == 'On') cmd = `litra on -s ${ id }`;

	let s = (await execSync(cmd)).toString();

	devices = await deviceList();
	device = devices.filter((d) => {
		return d.id == id;
	})[0];

	res.send(device);
}));

router.post('/toggle/:id', async function(req, res)
{
	let { id } = req.params;
	let devices = await deviceList();
	let device = devices.filter((d) => {
		return d.id == id;
	})[0];

	if (!device) return res.send({});

	let cmd = `litra ${ device.state == 'On' ? 'off' : 'on' } -s ${ id }`;

	if (req.body.action) cmd = `litra ${ req.body.action } -s ${ id }`;

	let s = (await execSync(cmd)).toString();

	devices = await deviceList();
	device = devices.filter((d) => {
		return d.id == id;
	})[0];

	res.send(device);
});

module.exports = router;
