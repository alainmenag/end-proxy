/*
https://docin.divoom-gz.com/web/#/5/66

POST http://192.168.2.239/post

FileType - 2:play net file; other is err

{
    "Command": "Device/PlayTFGif",
    "FileType": 2,
    "FileName": "http://f.divoom-gz.com/64_64.gif"
}

{
    "Command":"Device/SetHighLightMode",
    "Mode":1
}

{
	"Command": "Channel/SetBrightness",
	"Brightness": 100
}

  {
"Command":"Tools/SetTimer",
"Minute": 1,
"Second": 0,
"Status": 1
}

  {
"Command":"Tools/SetStopWatch",
"Status": 1
}

  {
"Command":"Tools/SetScoreBoard",
"BlueScore": 200,
"RedScore": 79
}






{
"Command":"Draw/SendHttpText",
"TextId":5,
"x":0,
"y":10,
"dir":0,
"font":1,
"TextWidth":64,
"speed":50,
"TextString":"hello, Divoom",
"color":"#FFFF00",
"align":1
}

{
"Command":"Draw/SendHttpText",
"TextId":4,
"x":0,
"y":40,
"dir":0,
"font":4,
"TextWidth":64,
"speed":100,
"TextString":"hello, Divoom",
"color":"#FFFF00",
"align":1
}


{
    "Command":"Device/PlayTFGif",
    "FileType":2,
    "FileName":"http://192.168.2.231:8715/api/pixoo/gif"
}


{
	"Command":"Draw/ClearHttpText"
}

{
	"Command":"Draw/SendHttpItemList",
	"ItemList":[
		{
			"TextId":20,
			"type":23,
			"x":0,
			"y":48,
			"dir":0,
			"font":4,
			"TextWidth":64,
			"Textheight":16,
			"speed":100,
			"update_time":5,
			"align":1,
			"TextString":"http://192.168.2.231:8715/api/pixoo/text",
			"color":"#FFF000"
		}
	]
}


{
    "Command":"Draw/UseHTTPCommandSource",
    "CommandUrl":"http://192.168.2.231:8715/api/pixoo/commands"
}


*/

const router = require('express').Router();
const { exec, execSync } = require('child_process');
const { GifBuilder } = require('gif-ness-canvas');
const { createCanvas, loadImage } = require('canvas');

const api = {};

router.get('/text', (async function(req, res)
{
	res.send({
		"ReturnCode": 0,
		"ReturnMessage": "",
		"DispData": "test"
	});
}));

router.get('/commands', (async function(req, res)
{
	res.send({
		"Command": "Draw/CommandList",
		"CommandList": [
			{
				"Command": "Device/PlayTFGif",
				"FileType": 2,
				"FileName": "http://192.168.2.231:8715/api/pixoo/gif"
			},
			{
				"Command": "Draw/SendHttpItemList",
				"ItemList": [
					{
						"TextId": 20,
						"type": 23,
						"x": 0,
						"y": 48,
						"dir": 0,
						"font": 4,
						"TextWidth": 64,
						"Textheight": 16,
						"speed": 100,
						"update_time": 5,
						"align": 1,
						"TextString": "http://192.168.2.231:8715/api/pixoo/text",
						"color": "#FFF000"
					}
				]
			},
			{
				"Command": "Channel/SetBrightness",
				"Brightness": 100
			}
		]
	});
}));

//https://github.com/DARK-ECNELIS/gif-ness-canvas
router.get('/gif', (async function(req, res)
{
	const gif = '/Users/alain/Desktop/endProxy/server/public/black-64-64.gif';

	//return res.sendFile(gif);

	const background = await loadImage('https://images.pexels.com/photos/620337/pexels-photo-620337.jpeg?cs=srgb&dl=pexels-pripicart-620337.jpg');
	const avatar = await loadImage('https://images.pexels.com/photos/620337/pexels-photo-620337.jpeg?cs=srgb&dl=pexels-pripicart-620337.jpg');
	
	const gif2 = "/Users/alain/Desktop/endProxy/server/public/black-64-64.gif"
	const image = await loadImage('https://images.pexels.com/photos/620337/pexels-photo-620337.jpeg?cs=srgb&dl=pexels-pripicart-620337.jpg');
	
	const builder = new GifBuilder(64, 64)
		.setAxis("TopLeft")
		.setCornerRadius(0)
		.setBackground(background) // Add Backgr  ound
		.setImage(gif, {sx: 64, sy: 64, sWidth: 64, sHeight: 64})
		//.setFrame("Square", { x: 25, y:25, size: 80 }, { type: "Image", content: avatar, color: "Brown" })
		//.setFrame("Circle", { x: 525, y: 25, size: 80 }, { type: "Image", content: image, color: "Crimson" })
		//.setFrame("Decagon", { x: 275, y: 75, size: 80 }, { type: "Image", content: gif2, color: "Fuchsia" })
  
	let buffer = await builder.toBuffer();

    res.writeHead(200, {
        'Content-Type': 'image/gif',
        'Content-Length': buffer.length
    });

    res.end(buffer);
}));

module.exports = router;
