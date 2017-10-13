module.exports = {

    createCronJobs: function(app) {
        app.route('/nodics/cronjob/create')
            .get(CONTROLLER.CronJobController.create);
        app.route('/nodics/cronjob/create')
            .post(CONTROLLER.CronJobController.create);
        app.route('/nodics/cronjob/create/:jobName')
            .get(CONTROLLER.CronJobController.create);
    },

    updateCronJobs: function(app) {
        app.route('/nodics/cronjob/update')
            .get(CONTROLLER.CronJobController.update);
        app.route('/nodics/cronjob/update')
            .post(CONTROLLER.CronJobController.update);
        app.route('/nodics/cronjob/update/:jobName')
            .get(CONTROLLER.CronJobController.update);
    },

    runCronJobs: function(app) {
        app.route('/nodics/cronjob/run')
            .get(CONTROLLER.CronJobController.run);
        app.route('/nodics/cronjob/run')
            .post(CONTROLLER.CronJobController.run);
        app.route('/nodics/cronjob/run/:jobName')
            .get(CONTROLLER.CronJobController.run);
    },

    startCronJob: function(app) {
        app.route('/nodics/cronjob/start/:jobName')
            .get(CONTROLLER.CronJobController.start);
        app.route('/nodics/cronjob/start')
            .post(CONTROLLER.CronJobController.start);
    },

    stopCronJob: function(app) {
        app.route('/nodics/cronjob/stop/:jobName')
            .get(CONTROLLER.CronJobController.stop);
        app.route('/nodics/cronjob/stop')
            .post(CONTROLLER.CronJobController.stop);
    },

    removeCronJob: function(app) {
        app.route('/nodics/cronjob/remove/:jobName')
            .get(CONTROLLER.CronJobController.remove);
        app.route('/nodics/cronjob/remove')
            .post(CONTROLLER.CronJobController.remove);
    },

    pauseCronJob: function(app) {
        app.route('/nodics/cronjob/pause/:jobName')
            .get(CONTROLLER.CronJobController.pause);
        app.route('/nodics/cronjob/pause')
            .post(CONTROLLER.CronJobController.pause);
    },

    resumeCronJob: function(app) {
        app.route('/nodics/cronjob/resume/:jobName')
            .get(CONTROLLER.CronJobController.resume);
        app.route('/nodics/cronjob/resume')
            .post(CONTROLLER.CronJobController.resume);
    }
};