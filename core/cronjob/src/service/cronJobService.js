/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
const _ = require('lodash');

module.exports = {
    cronJobContainer: new CLASSES.CronJobContainer(),

    getCronJobContainer: function() {
        return this.cronJobContainer;
    },

    createJob: function(request, callback) {
        let input = {
            tenant: request.tenant,
            options: {
                noLimit: true,
                query: CONFIG.get('cronjob').activeJobsQuery
            }
        };
        input = _.merge(input, request);
        SERVICE.CronJobService.get(input).then((models) => {
            if (callback) {
                this.cronJobContainer.createCronJobs(models).then(success => {
                    callback(null, success);
                }).catch(error => {
                    callback(error);
                });
            } else {
                return this.cronJobContainer.createCronJobs(models)
            }
        }).catch(error => {
            if (callback) {
                callback(error);
            } else {
                return Promise.reject(error);
            }
        });
    },

    updateJob: function(request, callback) {
        DAO.CronJobDao.get(request).then((models) => {
            try {
                let result = this.cronJobContainer.updateCronJobs(request, models);
                callback(null, result, request);
            } catch (error) {
                callback(error, null, request);
            }
        }).catch((error) => {
            callback(error, null, request);
        });
    },

    runJob: function(request, callback) {
        DAO.CronJobDao.get(request).then((models) => {
            try {
                let result = this.cronJobContainer.runCronJobs(request, models);
                callback(null, result, request);
            } catch (error) {
                callback(error, null, request);
            }
        }).catch((error) => {
            callback(error, null, request);
        });
    },

    startJob: function(request, callback) {
        try {
            let result = this.cronJobContainer.startCronJobs(request);
            callback(null, result);
        } catch (error) {
            callback(error, null);
        }
    },

    stopJob: function(request, callback) {
        try {
            // let result = this.cronJobContainer.stopCronJobs(request.jobNames);
            let result = this.cronJobContainer.stopCronJobs(request);
            callback(null, result, request);
        } catch (error) {
            callback(error, null, request);
        }
    },

    removeJob: function(request, callback) {
        try {
            //let result = this.cronJobContainer.removeCronJobs(request.jobNames);
            let result = this.cronJobContainer.removeCronJobs(request.jobNames);
            callback(null, result, request);
        } catch (error) {
            callback(error, null, request);
        }
    },

    pauseJob: function(request, callback) {
        try {
            //let result = this.cronJobContainer.pauseCronJobs(request.jobNames);
            let result = this.cronJobContainer.pauseCronJobs(request);
            callback(null, result, request);
        } catch (error) {
            callback(error, null, request);
        }
    },

    resumeJob: function(request, callback) {
        try {
            let result = this.cronJobContainer.resumeCronJobs(request);
            //let result = this.cronJobContainer.resumeCronJobs(request.jobNames);
            callback(null, result, request);
        } catch (error) {
            callback(error, null, request);
        }
    },

    startOnStartup: function() {
        if (CONFIG.get('cronjob').runOnStartup) {
            console.log('   INFO: Starting active jobs');
            if (NODICS.getServerState() === 'started') {
                SERVICE.CronJobService.createJob({ tenant: 'default' }, (error, response) => {
                    console.log(response);
                    if (error) {
                        console.log('   ERROR: Something went wrong while creating CronJobs : ', error);
                    } else {
                        SERVICE.CronJobService.startJob({ jobNames: response }, (error, response) => {
                            console.log('   INFO: triggered cronjob start process : ', response);
                        });
                    }
                });
            } else {
                console.log('   INFO: Server is not started yet, hence waiting');
                setTimeout(SERVICE.CronJobService.startOnStartup, CONFIG.get('cronjob').waitTime || 100);
            }
        }
    },
};