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
    },

    resetEvents: function (request, callback) {
        if (!UTILS.isBlank(request.httpRequest.body)) {
            request = _.merge(request, request.httpRequest.body || {});
        }
        request.body = request.httpRequest.body || {};
        if (callback) {
            FACADE.DefaultEventHandlerFacade.resetEvents(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultEventHandlerFacade.resetEvents(request);
        }
    }
};