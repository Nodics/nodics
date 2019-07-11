var exec = require('child_process').exec;

module.exports = {
    runJava: function() {
        exec('java -jar C:/javaApp.jar',
            function(error, stdout, stderr) {
                console.log('Output -> ' + stdout);
                if (error !== null) {
                    console.log("Error -> " + error);
                }
            });
    }
};