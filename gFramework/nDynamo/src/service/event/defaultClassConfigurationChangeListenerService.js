module.exports = {

    handleClassConfigurationChange: function (event, callback) {
        let _self = this;
        _self.LOG.debug('Event has been Handled.....................');
        _self.LOG.debug(event);
        _self.LOG.debug('...........................................');
        callback(null, {
            success: true,
            code: 'SUC_EVNT_00000',
            msg: '#Event has been Handled '
        });
    }
};