module.exports = {

    handleListenerUpdateEvent: function (event, callback) {
        try {
            SERVICE.DefaultEventService.handleListenerUpdateEvent(event.data).then(success => {
                callback(null, {
                    code: 'SUC_EVNT_00000',
                    message: success
                });
            }).catch(error => {
                callback(new CLASSES.EventError(error));
            });
        } catch (error) {
            callback(new CLASSES.EventError(error));
        }
    },

    handleListenerRemovedEvent: function (event, callback) {
        try {
            SERVICE.DefaultEventService.handleListenerRemovedEvent(event.data).then(success => {
                callback(null, {
                    code: 'SUC_EVNT_00000',
                    message: success
                });
            }).catch(error => {
                callback(new CLASSES.EventError(error));
            });
        } catch (error) {
            callback(new CLASSES.EventError(error));
        }
    }
};