module.exports = {

    handleRouterCacheChangeEvent: function (event, callback) {
        try {
            SERVICE.DefaultCacheService.handleRouterCacheChangeEvent({
                moduleName: request.target,
                config: event.data
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
        } catch (error) {
            callback({
                success: false,
                code: 'ERR_EVNT_00000',
                msg: error
            });
        }
    },

    handleItemCacheChangeEvent: function (event, callback) {
        try {
            SERVICE.DefaultCacheService.handleItemCacheChangeEvent({
                moduleName: request.target,
                config: event.data
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
        } catch (error) {
            callback({
                success: false,
                code: 'ERR_EVNT_00000',
                msg: error
            });
        }
    }
};