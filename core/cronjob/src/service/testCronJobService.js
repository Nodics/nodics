module.exports = {
    //Created this class to test if cronJob run process works fine
    options: {
        isNew: true
    },

    runJob: function(definition) {
        console.log('CronJos Started................1111 ');
    },

    stopJob: function(definition) {
        console.log('CronJos Started................ stopJob');
    }
}