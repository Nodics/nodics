module.exports = {

    handlePipelineChangeEvent: function (request, callback) {
        try {
            SERVICE.DefaultPipelineService.handlePipelineChangeEvent(request).then(success => {
                callback(null, { code: 'SUC_EVNT_00000', message: success });
            }).catch(error => {
                callback(new CLASSES.EventError(error, 'Unable to handle workflow2schema update handler', 'ERR_EVNT_00000'));
            });
        } catch (error) {
            callback(new CLASSES.EventError(error, 'Unable to handle workflow2schema update handler', 'ERR_EVNT_00000'));
        }
    },
    handlePipelineRemovedEvent: function (request, callback) {
        try {
            SERVICE.DefaultPipelineService.handlePipelineRemovedEvent(request).then(success => {
                callback(null, { code: 'SUC_EVNT_00000', message: success });
            }).catch(error => {
                callback(new CLASSES.EventError(error, 'Unable to handle workflow2schema update handler', 'ERR_EVNT_00000'));
            });
        } catch (error) {
            callback(new CLASSES.EventError(error, 'Unable to handle workflow2schema update handler', 'ERR_EVNT_00000'));
        }
    }
};