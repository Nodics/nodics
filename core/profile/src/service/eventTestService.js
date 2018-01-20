module.exports = {
    options: {
        isNew: true
    },

    handleTestEvent: function(event, callback) {
        console.log('------- Event has been Handled ');
        callback(null, 'success');
    }
};