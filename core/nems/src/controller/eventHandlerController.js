module.exports = {
    options: {
        isNew: true
    },

    processEvents: function(requestContext, callback) {
        FACADE.EventHandlerFacade.processEvents(requestContext, callback);
    }
};