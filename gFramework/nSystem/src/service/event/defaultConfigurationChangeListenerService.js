module.exports = {

    handleConfigurationChangeEvent: function (request, callback) {
        try {
            SERVICE.DefaultConfigurationService.handleConfigurationChangeEvent(request).then(success => {
                callback(null, { code: 'SUC_EVNT_00000', message: success });
            }).catch(error => {
                callback(new CLASSES.EventError(error, 'Unable to handle configuration update handler', 'ERR_EVNT_00000'));
            });
        } catch (error) {
            callback(new CLASSES.EventError(error, 'Unable to handle configuration update handler', 'ERR_EVNT_00000'));
        }
    }
};