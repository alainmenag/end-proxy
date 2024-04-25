/// <reference path="libs/js/action.js" />
/// <reference path="libs/js/stream-deck.js" />

const api = {
	host: 'http://127.0.0.1:8715',
	actions: {},
};

api.setFeedback = (context, data) =>
{
	let {current, max, min} = data.brightness;
	let percent = ((current - min) / (max - min)) * 100;

	$SD.setFeedback(context, {
		value: data.state == 'Off' ? 'OFF' : (`${ Math.round(percent) }`),
		indicator: ((current - min) / (max - min)) * 100
	});
};

// broadcast to all actions that share the same device id
api.broadcastFeedback = (id, data) =>
{
	for (const context in api.actions)
	{
		let action = api.actions[context];

		if (action.settings.id != id) continue;

		api.setFeedback(context, data);
	}
};

/**
 * The first event fired when Stream Deck starts
 */
$SD.onConnected(({ actionInfo, appInfo, connection, messageType, port, uuid }) =>
{
	console.log('Stream Deck connected!', Date.now());
});
