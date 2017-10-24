const cronJobBuilder = require('./bin/cronJobBuilder');

module.exports.init = function() {
    console.log('=> Starting CronJob Generation process');
    cronJobBuilder.init();
};