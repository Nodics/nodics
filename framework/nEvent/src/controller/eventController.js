module.exports = {
    options: {
        isNew: true
    },

    validateEvent: function(event) {
        if (UTILS.isBlank(event)) {
            throw Error('Event can not be empty');
        }
        return true;
    },

    handleEvent: function(requestContext, callback) {
        if (CONTROLLER.EventController.validateEvent(requestContext.httpRequest.body)) {
            FACADE.EventFacade.handleEvent(requestContext.httpRequest.body, callback);
        }
    },

    publish: function(requestContext, callback) {
        if (CONTROLLER.EventController.validateEvent(requestContext.httpRequest.body)) {
            FACADE.EventFacade.publish(requestContext.httpRequest.body, callback);
        }
    }
};