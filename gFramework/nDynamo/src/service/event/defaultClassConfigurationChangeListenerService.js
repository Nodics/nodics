module.exports = {

    handleClassUpdateEventHandler: function (event, callback) {
        try {
            SERVICE.DefaultClassConfigurationService.classUpdateEventHandler(event.data).then(success => {
                callback(null, {
                    success: true,
                    code: 'SUC_EVNT_00000',
                    msg: success
                });
            }).catch(error => {
                callback({
                    success: false,
                    code: 'ERR_EVNT_00000',
                    msg: error
                });
            });
        } catch (error) {
            callback({
                success: false,
                code: 'ERR_EVNT_00000',
                msg: error
            });
        }
    }
};