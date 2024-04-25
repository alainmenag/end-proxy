/// <reference path="../../../libs/js/property-inspector.js" />
/// <reference path="../../../libs/js/utils.js" />

const api = {
	host: 'http://127.0.0.1:8715',
};

api.fetchScenes = (settings) =>
{
	const backup = () =>
	{
		// scene's related select option
		let option = scenes.querySelector(`option[value="${ settings.sceneUuid }"]`);

		console.log('fetchScnes', 'backup', settings, option);

		// check if option for current setting id is avail. or create.
		if (settings.sceneUuid && !option)
		{
			option = document.createElement('option');

			option.value = settings.sceneUuid;
			option.textContent = `(${ settings.sceneUuid })`;
			option.selected = true;
			
			scenes.appendChild(option);
		}

		if (settings.sourceUuid) api.fetchSources(settings);
	};

	// get scenes
	fetch(`${ api.host }/api/obs`).then((r) =>
	{
		return r.json();
	}).then((data) =>
	{
		if (data && data.length) for (let i = 0; i < data.length; i ++)
		{
			let scene = data[i];
			let option = document.createElement('option');

			option.value = scene.sceneUuid;
			option.textContent = scene.sceneName;
			
			if (settings.sceneUuid == scene.sceneUuid) option.selected = true;
			
			scenes.appendChild(option);
		}

		backup();
	}).catch(() =>
	{
		backup();
	});
};

api.fetchSources = (settings) =>
{
	sources.innerHTML = '<option></option>';

	const backup = () =>
	{
		// source's related select option
		let option = sources.querySelector(`option[value="${ settings.sourceUuid }"]`);

		console.log('fetchSources', 'backup', settings, option);

		// check if option for current setting id is avail. or create.
		if (settings.sourceUuid && !option)
		{
			option = document.createElement('option');

			option.value = settings.sourceUuid;
			option.textContent = `(${ settings.sourceUuid })`;
			option.selected = true;
			
			sources.appendChild(option);
		}
	};

	fetch(`${ api.host }/api/obs/${ settings.sceneUuid }`).then((r) =>
	{
		return r.json();
	}).then((data) =>
	{
		if (data && data.length) for (let i = 0; i < data.length; i ++)
		{
			let source = data[i];
			let option = document.createElement('option');

			option.value = source.sourceUuid;
			option.textContent = source.sourceName;
			
			if (settings.sourceUuid == source.sourceUuid) option.selected = true;
			
			sources.appendChild(option);
		}

		backup();
	}).catch(() => {
		backup();
	});
};

$PI.onConnected((jsn) =>
{
    const form = document.querySelector('#property-inspector');
    const {actionInfo, appInfo, connection, messageType, port, uuid} = jsn;
    const {payload, context} = actionInfo;
    const {settings, controller} = payload;

	console.log('***** Connected $PI', actionInfo, form, settings);

    Utils.setFormValue(settings, form);

    form.addEventListener(
        'input',
        Utils.debounce(150, (e) =>
		{
			// reset on scene change
			if (e.target.name == 'sceneUuid') [
				document.querySelector('[name="sourceUuid"]').value = null,
				sources.innerHTML = '<option></option>',
			];

            const value = Utils.getFormValue(form);

            $PI.setSettings(value);

			if (!value.sourceUuid) api.fetchSources(value);
        })
    );

	api.fetchScenes(settings);
});
