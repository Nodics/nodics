module.exports = {

    handleTestEvent: function(event, callback) {
        console.log('   INFO: #Event has been Handled ');
        callback(null, 'success');
    }
};