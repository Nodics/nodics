const _ = require('lodash');

module.exports = {
    init: function() {
        let listeners = SYSTEM.loadFiles('/src/event/listeners.js');
        let modules = NODICS.getModules();
        _.each(modules, function(value, moduleName) {
            value.eventService = new CLASSES.EventService();
            if (listeners[moduleName]) {
                _.each(listeners[moduleName], function(listenerDefinition, listenerName) {
                    value.eventService.registerListener(listenerDefinition);
                });
            }
        });
    }
};