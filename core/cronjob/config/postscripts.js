module.exports = {
    startJobsOnStartup: function() {
        SERVICE.CronJobService.startOnStartup();
    }
};