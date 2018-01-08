module.exports = {
    options: {
        isNew: true
    },

    handleEvent: function(event, callback) {
        SERVICE.EventService.handleEvent(event, callback);
    },

    publish: function(event, callback) {
        SERVICE.EventService.publish(event, callback);
    }
};