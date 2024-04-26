console.clear();

require('dotenv').config({ path: __dirname + '/../.env' });

const routes = require('./routes');

process.on('uncaughtException', function(err) {
	
	try {err = err.toString()} catch(e) {};
	
	console.log('***** uncaughtException:', err);
        
});