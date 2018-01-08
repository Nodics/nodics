module.exports = {
    options: {
        isNew: true
    },

    handleEvent: function(event, callback) {
        if (!NODICS.getModules()[event.target].eventService.emit(event.event, event, callback)) {
            callback('There is no Listener register for this event', null);
        }
    },

    publish: function(eventDef, callback) {
        let eventUrl = SERVICE.ModuleService.buildRequest('nems', 'PUT', 'event', eventDef, null, true);
        SERVICE.ModuleService.fetch(eventUrl, callback);
    }
};