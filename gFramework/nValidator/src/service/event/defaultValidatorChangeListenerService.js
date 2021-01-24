module.exports = {

    handleValidatorChangeEvent: function (event, callback) {
        try {
            SERVICE.DefaultValidatorService.handleValidatorChangeEvent(request).then(success => {
                callback(null, {
                    code: 'SUC_EVNT_00000',
                    message: success
                });
            }).catch(error => {
                callback(new CLASSES.EventError(error, 'Unable to handle validator change', 'ERR_EVNT_00000'));
            });
        } catch (error) {
            callback(new CLASSES.EventError(error, 'Unable to handle validator change', 'ERR_EVNT_00000'));
        }
    }
};