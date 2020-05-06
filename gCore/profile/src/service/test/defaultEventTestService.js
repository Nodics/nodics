module.exports = {

    handleTestEvent: function (request, callback) {
        let _self = this;
        _self.LOG.debug('#Event has been Handled ');
        callback(null, {
            code: 'SUC_EVNT_00000',
            message: '====>> Event has been Handled '
        });
    }
};