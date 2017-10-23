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

    start: function(inputParam) {
        return SERVICE.CronJobService.start(inputParam);
    },

    stop: function(inputParam) {
        return SERVICE.CronJobService.stop(inputParam);
    },

    remove: function(inputParam) {
        return SERVICE.CronJobService.remove(inputParam);
    },

    pause: function(inputParam) {
        return SERVICE.CronJobService.pause(inputParam);
    },

    resume: function(inputParam) {
        return SERVICE.CronJobService.resume(inputParam);
    }
};