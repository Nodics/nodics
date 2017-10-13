module.exports = {
    options: {
        isNew: false
    },

    cronJobContainer: new CLASSES.CronJobContainer(),

    getCronJobContainer: function() {
        return this.cronJobContainer;
    },

    getQuery: function(inputParam) {
        let option = {
            query: {}
        };
        if (inputParam.req) {
            if (inputParam.req.body) {
                option.query = inputParam.req.body;
            } else if (inputParam.req.params.jobName) {
                if (inputParam.req.params.jobName.toUpperCase() === "all".toUpperCase()) {
                    option.query = {};
                } else {
                    option.query = { name: inputParam.req.params.jobName };
                }
            }
        } else if (inputParam) {
            option = inputParam;
        }
        return option;
    },
    create: function(inputParam, callback) {
        let response = {};
        DAO.CronJobDao.get(this.getQuery(inputParam)).then((models) => {
            try {
                let result = this.cronJobContainer.createCronJobs(models);
                this.handleResponse(null, result, inputParam, callback);
            } catch (error) {
                this.handleResponse(error, null, inputParam, callback);
            }
        }).catch((error) => {
            this.handleResponse(error, null, inputParam, callback);
        });
    },
    update: function(inputParam, callback) {
        let response = {};
        DAO.CronJobDao.get(this.getQuery(inputParam)).then((models) => {
            try {
                let result = this.cronJobContainer.updateCronJobs(models);
                this.handleResponse(null, result, inputParam, callback);
            } catch (error) {
                this.handleResponse(error, null, inputParam, callback);
            }
        }).catch((error) => {
            this.handleResponse(error, null, inputParam, callback);
        });
    },

    run: function(inputParam, callback) {
        let response = {};
        DAO.CronJobDao.get(this.getQuery(inputParam)).then((models) => {
            try {
                let result = this.cronJobContainer.runCronJobs(models);
                this.handleResponse(null, result, inputParam, callback);
            } catch (error) {
                this.handleResponse(error, null, inputParam, callback);
            }
        }).catch((error) => {
            this.handleResponse(error, null, inputParam, callback);
        });
    },

    start: function(inputParam, callback) {
        let response = {};
        try {
            if (inputParam.jobName instanceof Array) {
                response = this.cronJobContainer.startCronJobs(inputParam.jobName);
            } else {
                if (inputParam.jobName.toUpperCase() === "all".toUpperCase()) {
                    response = this.cronJobContainer.startCronJobs();
                } else {
                    response = this.cronJobContainer.startCronJob(inputParam.jobName);
                }
            }

        } catch (error) {
            response.success = false;
            response.code = 'ERR001';
            response.msg = error;
        }
        if (callback) {
            callback(response, inputParam);
        } else {
            inputParam.res.json(response);
        }
    },

    stop: function(inputParam, callback) {
        let response = {};
        try {
            if (inputParam.jobName instanceof Array) {
                response = this.cronJobContainer.stopCronJobs(inputParam.jobName);
            } else {
                if (inputParam.jobName.toUpperCase() === "all".toUpperCase()) {
                    response = this.cronJobContainer.stopCronJobs();
                } else {
                    response = this.cronJobContainer.stopCronJob(inputParam.jobName);
                }
            }
        } catch (error) {
            response.success = false;
            response.code = 'ERR001';
            response.msg = error;
        }
        if (callback) {
            callback(response, inputParam);
        } else {
            inputParam.res.json(response);
        }
    },

    remove: function(inputParam, callback) {
        let response = {};
        try {
            if (inputParam.jobName instanceof Array) {
                response = this.cronJobContainer.removeCronJobs(inputParam.jobName);
            } else {
                if (inputParam.jobName.toUpperCase() === "all".toUpperCase()) {
                    response = this.cronJobContainer.removeCronJobs();
                } else {
                    response = this.cronJobContainer.removeCronJob(inputParam.jobName);
                }
            }
        } catch (error) {
            response.success = false;
            response.code = 'ERR001';
            response.msg = error;
        }
        if (callback) {
            callback(response, inputParam);
        } else {
            inputParam.res.json(response);
        }
    },

    pause: function(inputParam, callback) {
        let response = {};
        try {
            if (inputParam.jobName instanceof Array) {
                response = this.cronJobContainer.pauseCronJobs(inputParam.jobName);
            } else {
                if (inputParam.jobName.toUpperCase() === "all".toUpperCase()) {
                    response = this.cronJobContainer.pauseCronJobs();
                } else {
                    response = this.cronJobContainer.pauseCronJob(inputParam.jobName);
                }
            }
        } catch (error) {
            response.success = false;
            response.code = 'ERR001';
            response.msg = error;
        }
        if (callback) {
            callback(response, inputParam);
        } else {
            inputParam.res.json(response);
        }
    },

    resume: function(inputParam, callback) {
        let response = {};
        try {
            if (inputParam.jobName instanceof Array) {
                response = this.cronJobContainer.resumeCronJobs(inputParam.jobName);
            } else {
                if (inputParam.jobName.toUpperCase() === "all".toUpperCase()) {
                    response = this.cronJobContainer.resumeCronJobs();
                } else {
                    response = this.cronJobContainer.resumeCronJob(inputParam.jobName);
                }
            }
        } catch (error) {
            response.success = false;
            response.code = 'ERR001';
            response.msg = error;
        }
        if (callback) {
            callback(response, inputParam);
        } else {
            inputParam.res.json(response);
        }
    },

    startOnStartup: function() {
        if (CONFIG.startJobsOnStartup) {
            if (CONFIG.SERVER_STATE === 'running') {
                SERVICE.CronJobService.createCronJobs({}, (error, response) => {
                    if (error) {
                        console.log('Something went wrong while creating CronJobs');
                    } else {
                        SERVICE.CronJobService.startCronJob('all');
                    }
                });
            } else {
                setTimeout(SERVICE.CronJobService.startOnStartup, CONFIG.cronJobStartWaitInterval);
            }
        }
    },
};