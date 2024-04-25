
const litraAction = new Action('com.litra.action');

litraAction.onWillDisappear(({ action, context, device, event, payload }) =>
{
	delete api.actions[context]; // uncache
});

litraAction.onWillAppear(({ action, context, device, event, payload }) =>
{
	api.actions[context] = payload; // cache to update on others change

	const settings = payload.settings;
	
	if (settings.id) fetch(`${ api.host }/api/litra/${ settings.id }`).then((r) =>
	{
		return r.json();
	}).then((data) =>
	{
		api.setFeedback(context, data);
	}).catch((err) =>
	{
		$SD.send(context, "showAlert", {});
	});
});

litraAction.onKeyDown(({ action, context, device, event, payload }) =>
{
	const settings = payload.settings;

	fetch(`${ api.host }/api/litra/toggle/${ settings.id }`, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
		},
		body: JSON.stringify({
			ts: Date.now(),
			action: settings.action
		})
	}).then((r) =>
	{
		return r.json();
	}).then((data) =>
	{
		api.broadcastFeedback(settings.id, data); // send results to other matching actions with the same settings/device id
	}).catch((err) =>
	{
		$SD.send(context, "showAlert", {});
	});	
});

litraAction.onTouchTap(({ action, context, device, event, payload }) =>
{
	const settings = payload.settings;

	fetch(`${ api.host }/api/litra/toggle/${ settings.id }`, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
		},
		body: JSON.stringify({
			ts: Date.now(),
			amount: payload.ticks
		})
	}).then((r) =>
	{
		return r.json();
	}).then((data) =>
	{
		api.setFeedback(context, data);
	}).catch((err) =>
	{
		$SD.send(context, "showAlert", {});
	});
});

litraAction.onDialRotate(({ action, context, device, event, payload }) =>
{
	const settings = payload.settings;

	fetch(`${ api.host }/api/litra/dial/${ settings.id }`, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
		},
		body: JSON.stringify({
			ts: Date.now(),
			pressed: payload.pressed,
			amount: payload.ticks
		})
	}).then((r) =>
	{
		return r.json();
	}).then((data) =>
	{
		api.setFeedback(context, data);
	}).catch((err) =>
	{
		$SD.send(context, "showAlert", {});
	});
});
