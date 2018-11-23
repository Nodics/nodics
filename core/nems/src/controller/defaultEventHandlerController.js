module.exports = {

    processEvents: function (request, callback) {
        console.log('--------- Starting event process');
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