module.exports = {

    processEvents: function (request, callback) {
        FACADE.DefaultEventHandlerFacade.processEvents(request, callback);
    }
};