module.exports = {

    handleTestEvent: function(event, callback) {
        this.LOG.debug('#Event has been Handled ');
        callback(null, 'success');
    }
};