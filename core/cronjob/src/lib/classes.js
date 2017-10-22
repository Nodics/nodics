module.exports = {
    generalizeCronJob: function() {
        CLASSES.CronJob.prototype.getMyName = function() {
            console.log('Hi This is Generalized one');
        };

        CLASSES.CronJob.getName = function() {
            console.log('Hi This is Generalized two');
        };
    }
};