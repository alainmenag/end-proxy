/*
	tail -f /Users/alain/Library/Application\ Support/obs-studio/logs/*	

node /Users/alain/Desktop/cast/broadcast.js 'Windowed - Code' 'Mr. Jango';
node /Users/alain/Desktop/cast/broadcast.js 'Windowed - Code' 'Dev. Tools';
node /Users/alain/Desktop/cast/broadcast.js 'Windowed - Code' 'VSC';
node /Users/alain/Desktop/cast/broadcast.js 'Windowed - Code' 'Terminal';

POST /api/obs/resource
{"scene":"Windowed - Code","source":"Mr. Jango","match":"[Google Chrome] Mr. Jango (Dev.)"}
{"scene":"Windowed - Code","source":"Dev. Tools","match":"[Google Chrome] DevTools - localhost:3000/"}
{"scene":"Windowed - Code","source":"VSC","match":"[Code] entities.js — main (Workspace)"}
{"scene":"Windowed - Code","source":"Terminal","match":"npm run dev"}

*/

const router = require('express').Router();
const OBSWebSocket = require('obs-websocket-js').default;

router.post('/resource', (async function(req, res)
{
	// Create a new instance of OBSWebSocket
	const obs = new OBSWebSocket();

	// Define the connection parameters
	const address = 'ws://localhost:4444';
	const password = 'abc123';




	res.send({});
}));

module.exports = router;





/*

const scenes = {
	'Windowed - Code': {
		'Mr. Jango': {
			match: '[Google Chrome] Mr. Jango (Dev.)'
		},
		'Dev. Tools': {
			match: '[Google Chrome] DevTools - localhost:3000/'
		},
		'VSC': {
			match: '[Code] entities.js — main (Workspace)'
		},
		'Terminal': {
			match: 'npm run dev'
		}
	}
};



// node broadcast.js 'Windowed - Code' 'VSC'

const [arg1, arg2, sceneName, inputName] = process.argv;
const scene = scenes[sceneName];

if (!scene) return process.exit(1);

let tracker = 0;

// Connect to the OBS WebSocket server
obs.connect(address, password).then(() =>
{
	console.log(`***** ${ address }`, 'CONNECTED');
	
	// get a list of sources for a given scene
	tracker ++; obs.socket.send(JSON.stringify({
		op: 6,
		d: {
			requestType: 'GetSceneItemList',
			requestId: 'f819dcf0-89cc-11eb-8f0e-382c4ac93b9c',
			requestData: {
				sceneName: sceneName,
			}
		}
	}));
	
	obs.socket.addEventListener('message', event =>
	{
		// Parse the response from JSON
		const response = JSON.parse(event.data);
		
		if (!response || !response?.d?.requestType) return obs.disconnect();
		
		if (response.d.requestType == 'GetSceneItemList')
		{
			tracker --;
	
			let items = response?.d?.responseData?.sceneItems || [];
			
			if (!items || !items.length) return obs.disconnect();
			
			for (const { sourceName, sourceUuid } of items)
			{
				if (sourceName != inputName) continue;
				
				scene[sourceName] = scene[sourceName] || {};
				
				scene[sourceName].sourceUuid = sourceUuid;
				
				tracker ++; obs.socket.send(JSON.stringify({
					op: 6,
						d: {
							requestType: 'GetInputPropertiesListPropertyItems',
							requestId: `${ sourceName }:${ Date.now() }`,
							requestData: {
								inputUuid: sourceUuid, 
								propertyName: 'window',
							}
					}
				}));
			}		
		}
		
		if (response.d.requestType == 'GetInputPropertiesListPropertyItems')
		{
			tracker --;
			
			let sourceName = response.d.requestId.split(':')[0];
			let source = scene[sourceName];
			
			let window = response.d.responseData.propertyItems.find((item) =>
			{
				return item.itemName.indexOf(source.match) >= 0;
			});
			
			// update the source's window id
			if (window)
			{
				let d = {
					requestType: 'SetInputSettings',
					requestId: `${ sourceName }:${ Date.now() }`,
					requestData: {
						inputUuid: source.sourceUuid,
						inputSettings:
						{
							window: window.itemValue
						}
					}
				};
				
				console.log('*****', sceneName, inputName, window);
				
				tracker ++; obs.socket.send(JSON.stringify({
					op: 6,
					d: d
				}));
			}
		}
		
		if (response.d.requestType == 'SetInputSettings')
		{
			tracker --;
		}
		
		// Disconnect from OBS WebSocket server
		if (!tracker) obs.disconnect();
	});
})
.catch(err =>
{
	console.log(`***** ${ address }`, 'ERROR');
	console.log(err);
});
*/

