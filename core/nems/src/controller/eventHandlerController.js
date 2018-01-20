module.exports = {
    options: {
        isNew: true
    },

    processEvents: function(requestContext, callback) {
        console.log('Starting controller with : ', request.tenant);
        FACADE.EventHandlerFacade.processEvents(requestContext, callback);
    }
};