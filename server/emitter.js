
const EventEmitter = require('events');

// Create an event emitter instance
const emitter = new EventEmitter();

// Export the emitter instance so it can be used in other scripts
module.exports = emitter;
