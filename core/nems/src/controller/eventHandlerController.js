module.exports = {
    options: {
        isNew: true
    },

    processEvents: function(requestContext, callback) {
        let request = {
            tenant: requestContext.tenant
        };
        console.log('Starting controller with : ', request.tenant);
        FACADE.EventHandlerFacade.processEvents(request, callback);
    }
};