module.exports = {

    handleItemChangeEvent: function (event, callback) {
        try {
            SERVICE.DefaultWorkflowService.handleItemChangeEvent(event).then(success => {
                callback(null, {
                    code: 'SUC_EVNT_00000',
                    message: success
                });
            }).catch(error => {
                callback(new CLASSES.EventError(error, 'Unable to handle workflow item change', 'ERR_EVNT_00000'));
            });
        } catch (error) {
            callback(new CLASSES.EventError(error, 'Unable to handle workflow item change', 'ERR_EVNT_00000'));
        }
    }
};