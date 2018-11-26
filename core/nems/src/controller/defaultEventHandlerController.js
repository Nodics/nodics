module.exports = {

    processEvents: function (request, callback) {
        if (callback) {
            FACADE.DefaultEventHandlerFacade.processEvents(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultEventHandlerFacade.processEvents(request);
        }

    }
};