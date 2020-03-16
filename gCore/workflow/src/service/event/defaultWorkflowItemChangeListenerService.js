module.exports = {

    handleItemChangeEvent: function (event, callback) {
        try {
            SERVICE.DefaultWorkflowService.handleItemChangeEvent(event).then(success => {
                let code = 'SUC_EVNT_00000';
                if ((success.result && success.result.length > 0) && (success.errors && success.errors.length > 0)) {
                    code = 'SUC_EVNT_00001';
                } else if ((!success.result || success.result.length > 0) && (success.errors && success.errors.length > 0)) {
                    code = 'ERR_EVNT_00000';
                }
                callback(null, {
                    code: code,
                    result: success.result,
                    errors: success.errors
                });
            }).catch(error => {
                callback(new CLASSES.EventError(error, 'Unable to handle workflow item change', 'ERR_EVNT_00000'));
            });
        } catch (error) {
            callback(new CLASSES.EventError(error, 'Unable to handle workflow item change', 'ERR_EVNT_00000'));
        }
    }
};