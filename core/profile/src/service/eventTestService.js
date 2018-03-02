module.exports = {

    handleTestEvent: function(event, callback) {
        console.log('------- Event has been Handled ');
        callback(null, 'success');
    }
};