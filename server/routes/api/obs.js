/*
	https://github.com/obsproject/obs-websocket/blob/master/docs/generated/protocol.md#getsceneitemlist

	tail -f /Users/alain/Library/Application\ Support/obs-studio/logs/*

	POST /api/obs/resource
	
	{"scene":"Windowed - Code","source":"Mr. Jango","match":"[Google Chrome] Mr. Jango (Dev.)"}
	{"scene":"Windowed - Code","source":"Dev. Tools","match":"[Google Chrome] DevTools - localhost:3000/"}
	{"scene":"Windowed - Code","source":"VSC","match":"[Code] entities.js — main (Workspace)"}
	{"scene":"Windowed - Code","source":"Terminal","match":"npm run dev"}

	{"sceneUuid":"9ddc38bd-da9b-4cde-96ca-dacd84cf1b8f","sourceUuid":"7a1e8f2a-7f4b-4dd8-9c07-8c8ab7b4ff20","match":"[Google Chrome] Mr. Jango (Dev.)"}
*/

const router = require('express').Router();
const OBSWebSocket = require('obs-websocket-js').default;

OBSWebSocket.request = async ({host, password}, payload) =>
{
	payload.requestId = payload.requestId || Date.now();

	return new Promise((resolve, reject) =>
	{
		// Create a new instance of OBSWebSocket
		const obs = new OBSWebSocket();
		const respond = (data) =>
		{
			obs.disconnect();

			resolve(data || {});
		};

		let tracker = 0;
		let address = host;

		// Connect to the OBS WebSocket server
		obs.connect(address, password).then(() =>
		{
			// send socket request (payload)
			tracker ++; obs.socket.send(JSON.stringify({
				op: 6,
				d: payload
			}));

			setTimeout(() =>
			{
				if (tracker) respond({});
			}, 10000);
		
			obs.socket.addEventListener('message', event =>
			{
				// Parse the response from JSON
				let requestId = null;
				let response = {}; try
				{
					response = JSON.parse(event.data);
					requestId = response.d.requestId;
				} catch(err) {};

				if (requestId != payload.requestId) return;

				tracker --;

				respond(requestId ? response.d : {});
			});
		})
		.catch(err =>
		{
			respond({error: err});
		});
	});
};

// get all scenes
router.get('/', (async function(req, res)
{
	const options = {};

	options.password = req.body.password || 'password';
	options.port = req.body.port || 4444;
	options.host = req.body.host || `ws://localhost:${ options.port }`;

	const GetSceneList = await OBSWebSocket.request(options, {
		requestType: 'GetSceneList',
		requestId: Date.now(),
		requestData: {
		}
	});

	res.send(GetSceneList?.responseData?.scenes || []);
}));

// get all sources for a scene
router.get('/:sceneUuid', (async function(req, res)
{
	const options = {};

	options.password = req.body.password || 'password';
	options.port = req.body.port || 4444;
	options.host = req.body.host || `ws://localhost:${ options.port }`;

	const GetSceneItemList = await OBSWebSocket.request(options, {
		requestType: 'GetSceneItemList',
		requestId: Date.now(),
		requestData: {
			sceneUuid: req.params.sceneUuid,
		}
	});
	
	res.send(GetSceneItemList?.responseData?.sceneItems || []);
}));

// re-source a scene's source
router.post('/resource', (async function(req, res)
{
	const options = {};

	console.log(JSON.stringify(req.body));

	options.password = req.body.password || 'password';
	options.port = req.body.port || 4444;
	options.host = req.body.host || `ws://localhost:${ options.port }`;

	const GetSceneItemList = await OBSWebSocket.request(options, {
		requestType: 'GetSceneItemList',
		requestId: Date.now(),
		requestData: {
			sceneName: req.body.scene,
			sceneUuid: req.body.sceneUuid
		}
	});

	const sceneItems = GetSceneItemList?.responseData?.sceneItems;
	const sceneItem = sceneItems && sceneItems.find ? sceneItems.find((item) =>
	{
		return item.sourceName == req.body.source || item.sourceUuid == req.body.sourceUuid;
	}) : null;

	// stop if not matching scene item/source
	if (!sceneItem) return res.send();

	const GetInputPropertiesListPropertyItems = await OBSWebSocket.request(options, {
		requestType: 'GetInputPropertiesListPropertyItems',
		requestId: Date.now(),
		requestData: {
			inputUuid: sceneItem.sourceUuid, 
			propertyName: 'window',
		}
	});

	const propertyItems = GetInputPropertiesListPropertyItems?.responseData?.propertyItems;

	// stop if no windows to use
	if (!propertyItems) return res.send({});

	// find a window by match to make the new source
	let window = propertyItems.find((item) =>
	{
		return item.itemName.indexOf(req.body.match) >= 0;
	});

	// stop if no window matched to "match" in body payload
	if (!window) return res.send({});

	const SetInputSettings = await OBSWebSocket.request(options, {
		requestType: 'SetInputSettings',
		requestId: Date.now(),
		requestData: {
			inputUuid: sceneItem.sourceUuid,
			inputSettings:
			{
				window: window.itemValue
			}
		}
	});

	res.send(SetInputSettings);
}));

module.exports = router;
