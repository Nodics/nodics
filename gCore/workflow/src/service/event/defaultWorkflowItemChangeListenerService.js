module.exports = {

    handleItemChangeEvent: function (request, callback) {
        try {
            SERVICE.DefaultWorkflowService.handleItemChangeEvent(request).then(success => {
                if (success.errors && success.errors.length > 0) {
                    let error = new CLASSES.EventError(success.errors[0]);
                    if (success.errors.length > 1) {
                        success.errors.forEach(err => {
                            error.add(err);
                        });
                    }
                    error.metadata = {
                        result: success.result,
                    };
                    callback(error);
                } else {
                    callback(null, success.result);
                }
            }).catch(error => {
                callback(new CLASSES.EventError(error, 'Unable to handle workflow item change', 'ERR_EVNT_00000'));
            });
        } catch (error) {
            callback(new CLASSES.EventError(error, 'Unable to handle workflow item change', 'ERR_EVNT_00000'));
        }
    }
};