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

    getCronJobContainer: function () {
        return this.cronJobContainer;
    },

    createJob: function (request) {
        return new Promise((resolve, reject) => {
            request = _.merge({
                options: {
                    noLimit: true,
                    projection: { _id: 0 }
                },
                query: CONFIG.get('cronjob').activeJobsQuery
            }, request);
            request.modelName = request.modelName || 'cronJob';
            SERVICE['Default' + request.modelName.toUpperCaseFirstChar() + 'Service'].get(request).then(result => {
                if (result.success && result.result && result.result.length > 0) {
                    this.cronJobContainer.createJobs(result.result).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    reject({
                        success: false,
                        code: 'ERR_JOB_00001'
                    });
                }
            }).catch(error => {
                reject(error);
            });
        });
    },

    updateJob: function (request) {
        return new Promise((resolve, reject) => {
            request = _.merge({
                options: {
                    noLimit: true
                },
                query: CONFIG.get('cronjob').activeJobsQuery
            }, request);
            request.modelName = request.modelName || 'cronJob';
            SERVICE['Default' + request.modelName.toUpperCaseFirstChar() + 'Service'].get(request).then((result) => {
                if (result.success && result.result && result.result.length > 0) {
                    this.cronJobContainer.updateJobs(result.result).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    reject({
                        success: false,
                        code: 'ERR_JOB_00001'
                    });
                }
            }).catch(error => {
                reject(error);
            });
        });
    },

    runJob: function (request) {
        return new Promise((resolve, reject) => {
            request = _.merge({
                options: {
                    noLimit: true
                },
                query: CONFIG.get('cronjob').activeJobsQuery
            }, request);
            request.modelName = request.modelName || 'cronJob';
            SERVICE.DefaultCronJobService.get(request).then((result) => {
                if (result.success && result.result && result.result.length > 0) {
                    this.cronJobContainer.runJobs(result.result).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    reject({
                        success: false,
                        code: 'ERR_JOB_00001'
                    });
                }
            }).catch(error => {
                reject(error);
            });
        });
    },

    startJob: function (request) {
        return this.cronJobContainer.startJobs(request.jobCodes);
    },

    stopJob: function (request) {
        return this.cronJobContainer.stopJobs(request.jobCodes);
    },

    removeJob: function (request) {
        return this.cronJobContainer.removeJobs(request.jobCodes);
    },

    pauseJob: function (request) {
        return this.cronJobContainer.pauseJobs(request.jobCodes);
    },

    resumeJob: function (request, callback) {
        return this.cronJobContainer.resumeJobs(request.jobCodes);
    },

    startOnStartup: function (_self) {
        _self = _self || this;
        if (CONFIG.get('cronjob').runOnStartup) {
            _self.LOG.debug('Starting all active jobs on server start-up: ' + NODICS.getServerState());
            if (NODICS.getServerState() === 'started') {
                _self.createJob({ tenant: 'default' }).then(response => {
                    _self.cronJobContainer.startAllJobs().then(success => {
                        _self.LOG.debug('triggered cronjob start process : ', response);
                    }).catch(error => {
                        _self.LOG.error('Something went wrong while starting CronJobs : ', error);
                    });
                }).catch(error => {
                    _self.LOG.error('Something went wrong while creating CronJobs : ', error);
                });
            } else {
                _self.LOG.info('Server is not started yet, hence waiting');
                setTimeout(() => {
                    _self.startOnStartup(_self);
                }, CONFIG.get('processRetrySleepTime') || 2000);
            }
        }
    },
};