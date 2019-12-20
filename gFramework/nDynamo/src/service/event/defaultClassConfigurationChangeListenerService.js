module.exports = {

    handleClassAddEventHandler: function (event, callback) {
        let body = event.data;
        SERVICE.DefaultClassConfigurationService.classAddEventHandler({
            body: body
        }).then(success => {
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
    },

    handleClassUpdateEventHandler: function (event, callback) {
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
    }
};