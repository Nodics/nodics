module.exports = {

    handleTestEvent: function (event, callback) {
        let _self = this;
        _self.LOG.debug('#Event has been Handled ');
        callback(null, {
            success: true,
            code: 'SUC_EVNT_00000',
            msg: '#Event has been Handled '
        });
        /*setTimeout(function () {
            _self.LOG.debug('#Event has been Handled ');
            callback(null, {
                success: true,
                code: 'SUC_EVNT_00000',
                msg: '#Event has been Handled '
            });
        }, 5000);*/
    }
};