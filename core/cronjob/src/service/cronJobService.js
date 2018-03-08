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
                return this.cronJobContainer.createCronJobs(models);
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
        let input = {
            tenant: request.tenant,
            options: {
                noLimit: true,
                query: CONFIG.get('cronjob').activeJobsQuery
            }
        };
        input = _.merge(input, request);
        console.log(' Request : ', input);
        SERVICE.CronJobService.get(input).then((models) => {
            console.log(' Return models : ', models);
            if (callback) {
                this.cronJobContainer.updateCronJobs(models).then(success => {
                    callback(null, success);
                }).catch(error => {
                    callback(error);
                });
            } else {
                return this.cronJobContainer.updateCronJobs(models);
            }
        }).catch(error => {
            if (callback) {
                callback(error);
            } else {
                return Promise.reject(error);
            }
        });
    },

    runJob: function(request, callback) {
        let input = {
            tenant: request.tenant,
            options: {
                noLimit: true,
                query: CONFIG.get('cronjob').activeJobsQuery
            }
        };
        input = _.merge(input, request);
        SERVICE.CronJobService.get(input).then((models) => {
            console.log(' Models : ', models);
            if (callback) {
                this.cronJobContainer.runCronJobs(models).then(success => {
                    callback(null, success);
                }).catch(error => {
                    callback(error);
                });
            } else {
                return this.cronJobContainer.runCronJobs(models);
            }
        }).catch(error => {
            if (callback) {
                callback(error);
            } else {
                return Promise.reject(error);
            }
        });
    },

    startJob: function(request, callback) {
        try {
            let result = this.cronJobContainer.startCronJobs(request.jobNames);
            callback(null, result);
        } catch (error) {
            callback(error);
        }
    },

    stopJob: function(request, callback) {
        try {
            let result = this.cronJobContainer.stopCronJobs(request.jobNames);
            callback(null, result);
        } catch (error) {
            callback(error);
        }
    },

    removeJob: function(request, callback) {
        try {
            let result = this.cronJobContainer.removeCronJobs(request.jobNames);
            callback(null, result);
        } catch (error) {
            callback(error);
        }
    },

    pauseJob: function(request, callback) {
        try {
            let result = this.cronJobContainer.pauseCronJobs(request.jobNames);
            callback(null, result);
        } catch (error) {
            callback(error);
        }
    },

    resumeJob: function(request, callback) {
        try {
            let result = this.cronJobContainer.resumeCronJobs(request.jobNames);
            callback(null, result);
        } catch (error) {
            callback(error);
        }
    },

    startOnStartup: function() {
        if (CONFIG.get('cronjob').runOnStartup) {
            console.log('   INFO: Starting all active jobs on server start-up');
            if (NODICS.getServerState() === 'started') {
                SERVICE.CronJobService.createJob({ tenant: 'default' }, (error, response) => {
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