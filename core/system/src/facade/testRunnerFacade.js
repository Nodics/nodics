module.exports = {

    runUTest: function(input, callback) {
        SERVICE.TestRunnerService.runUTest(input, callback);
    },

    runNTest: function(input, callback) {
        SERVICE.TestRunnerService.runNTest(input, callback);
    }

};