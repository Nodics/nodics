module.exports = {

    handleTestEvent: function(event, callback) {
        this.LOG.debug('   INFO: #Event has been Handled ');
        callback(null, 'success');
    }
};