module.exports = {
    options: {
        isNew: true
    },

    processEvents: function(request, callback) {
        console.log('Starting facade with : ', request.tenant);
        SERVICE.EventHandlerService.processEvents(request, callback);
    }
};