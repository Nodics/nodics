module.exports = {
    generalizeCronJob: function() {
        CLASSES.CronJob.prototype.getMyName = function() {
            console.log('Hi This is Himkar');
        };

        CLASSES.CronJob.getName = function() {
            console.log('Himkar Dwivedi -----');
        };
    }
};