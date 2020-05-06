module.exports = {

    handleConfigurationChangeEvent: function (event, callback) {
        try {
            SERVICE.DefaultConfigurationService.handleConfigurationChangeEvent({
                tenant: request.tenant,
                config: event.data
            }).then(success => {
                callback(null, {
                    success: true,
                    code: 'SUC_EVNT_00000',
                    message: success
                });
            }).catch(error => {
                callback({
                    success: false,
                    code: 'ERR_EVNT_00000',
                    message: error
                });
            });
        } catch (error) {
            callback({
                success: false,
                code: 'ERR_EVNT_00000',
                message: error
            });
        }
    }
};