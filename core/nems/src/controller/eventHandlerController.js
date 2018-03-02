module.exports = {

    processEvents: function(requestContext, callback) {
        FACADE.EventHandlerFacade.processEvents(requestContext, callback);
    }
};