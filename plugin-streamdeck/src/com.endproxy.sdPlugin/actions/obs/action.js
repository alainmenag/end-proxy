
const obsAction = new Action('com.obs.action');

obsAction.onKeyDown(({ action, context, device, event, payload }) =>
{
	fetch(`${ api.host }/api/obs/resource`, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
		},
		body: JSON.stringify(payload.settings)
	}).then((r) =>
	{
		return r.json();
	}).then((data) =>
	{
		console.log('resourced', data);
	}).catch((err) =>
	{
		$SD.send(context, "showAlert", {});
	});
});
