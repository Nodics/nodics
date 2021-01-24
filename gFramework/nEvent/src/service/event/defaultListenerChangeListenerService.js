module.exports = {

    handleListenerUpdateEvent: function (request, callback) {
        try {
            SERVICE.DefaultEventService.handleListenerUpdateEvent(request).then(success => {
                callback(null, { code: 'SUC_EVNT_00000', message: success });
            }).catch(error => {
                callback(new CLASSES.EventError(error, 'Unable to handle listener update handler', 'ERR_EVNT_00000'));
            });
        } catch (error) {
            callback(new CLASSES.EventError(error, 'Unable to handle listener update handler', 'ERR_EVNT_00000'));
        }
    },

    handleListenerRemovedEvent: function (request, callback) {
        try {
            SERVICE.DefaultEventService.handleListenerRemovedEvent(request).then(success => {
                callback(null, { code: 'SUC_EVNT_00000', message: success });
            }).catch(error => {
                callback(new CLASSES.EventError(error, 'Unable to handle listener removed handler', 'ERR_EVNT_00000'));
            });
        } catch (error) {
            callback(new CLASSES.EventError(error, 'Unable to handle listener removed handler', 'ERR_EVNT_00000'));
        }
    }
};