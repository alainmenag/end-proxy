/// <reference path="../../../libs/js/property-inspector.js" />
/// <reference path="../../../libs/js/utils.js" />

const api = {
	host: 'http://127.0.0.1:8715',
};

$PI.onConnected((jsn) =>
{
    const form = document.querySelector('#property-inspector');
    const {actionInfo, appInfo, connection, messageType, port, uuid} = jsn;
    const {payload, context} = actionInfo;
    const {settings, controller} = payload;

	console.log('***** Connected $PI', actionInfo, form);

    Utils.setFormValue(settings, form);

    form.addEventListener(
        'input',
        Utils.debounce(150, () =>
		{
            const value = Utils.getFormValue(form);
			
			//console.log('setSetting', value);

            $PI.setSettings(value);
        })
    );

	// get current devices
	fetch(`${ api.host }/api/litra`).then((r) =>
	{
		return r.json();
	}).then((data) =>
	{
		if (data && data.length) for (let i = 0; i < data.length; i ++)
		{
			let device = data[i];

			let option = document.createElement('option');

			option.value = device.id;
			option.textContent = `${ device.name } (${ device.id })`;
			
			if (settings.id == device.id) option.selected = true;
			
			devices.appendChild(option);
		}

		// device id's related select option
		let option = devices.querySelector(`option[value="${ settings.id }"]`);

		// check if option for current setting id is avail. or create.
		if (settings.id && !option)
		{
			option = document.createElement('option');

			option.value = settings.id;
			option.textContent = `(${ settings.id })`;
			option.selected = true;
			
			devices.appendChild(option);
		}
	});

	if (controller == 'Keypad')
	{
		let options = [
			{title: 'On', value: 'on'},
			{title: 'Off', value: 'off'},
		];

		for (let i = 0; i < options.length; i++)
		{
			let { title, value } = options[i];
			let option = document.createElement('option');

			option.textContent = title;
			option.value = value;
			
			if (settings.action == option.value) option.selected = true;

			actions.appendChild(option);
		}
	}
});
