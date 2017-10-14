module.exports = {
    options: {
        isNew: false
    },

    create: function(inputParam) {
        return SERVICE.CronJobService.create(inputParam);
    },

    update: function(inputParam) {
        return SERVICE.CronJobService.update(inputParam);
    },

    run: function(inputParam) {
        return SERVICE.CronJobService.run(inputParam);
    },

    start: function(cronJobName) {
        return SERVICE.CronJobService.start(inputParam);
    },

    stop: function(cronJobName) {
        return SERVICE.CronJobService.stop(inputParam);
    },

    remove: function(cronJobName) {
        return SERVICE.CronJobService.remove(inputParam);
    },

    pause: function(cronJobName) {
        return SERVICE.CronJobService.pause(inputParam);
    },

    resume: function(cronJobName) {
        return SERVICE.CronJobService.resume(inputParam);
    }
};