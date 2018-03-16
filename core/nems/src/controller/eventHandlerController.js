module.exports = {

    processEvents: function(request, callback) {
        FACADE.EventHandlerFacade.processEvents(request, callback);
    }
};