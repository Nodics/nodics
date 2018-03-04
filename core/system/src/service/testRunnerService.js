module.exports = {

    runUTest: function(input, callback) {
        if (callback) {
            SERVICE.TestExecutorService.executeUTest().then(success => {
                console.log('   INFO: U-Test cases Executed successfully');
                callback(null, 'U-Test cases Executed successfully');
            }).catch(error => {
                console.log('   ERROR: ', error);
                callback(error);
            });
        } else {
            return SERVICE.TestExecutorService.executeUTest();
        }
    },

    runNTest: function(input, callback) {
        if (callback) {
            SERVICE.TestExecutorService.executeNTest().then(success => {
                console.log('   INFO: N-Test cases Executed successfully');
                callback(null, 'N-Test cases Executed successfully');
            }).catch(error => {
                console.log('   ERROR: ', error);
                callback(error);
            });
        } else {
            return SERVICE.TestExecutorService.executeNTest();
        }
    }

};