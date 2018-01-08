const EventEmitter = require('events');

module.exports = class EventService extends EventEmitter {

    registerListener(listenerDefinition) {
        this.on(listenerDefinition.event, eval(listenerDefinition.listner));
    }
    sayHello() {
        console.log('Hey body .....................');
    }
};