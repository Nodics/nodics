module.exports = {

    handleInterceptorChangeEvent: function (request, callback) {
        try {
            SERVICE.DefaultInterceptorService.handleInterceptorChangeEvent(request).then(success => {
                callback(null, {
                    code: 'SUC_EVNT_00000',
                    message: success
                });
            }).catch(error => {
                callback(new CLASSES.EventError(error, 'Unable to handle interceptor change event', 'ERR_EVNT_00000'));
            });
        } catch (error) {
            callback(new CLASSES.EventError(error, 'Unable tohandle interceptor change event', 'ERR_EVNT_00000'));
        }
    }
};