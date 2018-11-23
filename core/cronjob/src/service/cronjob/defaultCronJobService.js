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
                    noLimit: true
                },
                query: CONFIG.get('cronjob').activeJobsQuery
            }, request);
            request.modelName = request.modelName || 'cronJob';
            SERVICE['Default' + request.modelName.toUpperCaseFirstChar() + 'Service'].get(request).then(result => {
                if (result.success && result.result && result.result.length > 0) {
                    this.cronJobContainer.createCronJobs(result.result).then(success => {
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
            SERVICE.DefaultCronJobService.get(request).then((result) => {
                if (result.success && result.result && result.result.length > 0) {
                    this.cronJobContainer.updateCronJobs(result.result).then(success => {
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
                    this.cronJobContainer.runCronJobs(result.result).then(success => {
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
        return new Promise((resolve, reject) => {
            try {
                let result = this.cronJobContainer.startCronJobs(request.jobCodes);
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    },

    stopJob: function (request) {
        return new Promise((resolve, reject) => {
            try {
                let result = this.cronJobContainer.stopCronJobs(request.jobCodes);
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    },

    removeJob: function (request, callback) {
        return new Promise((resolve, reject) => {
            try {
                let result = this.cronJobContainer.removeCronJobs(request.jobCodes);
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    },

    pauseJob: function (request) {
        return new Promise((resolve, reject) => {
            try {
                let result = this.cronJobContainer.pauseCronJobs(request.jobCodes);
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    },

    resumeJob: function (request, callback) {
        return new Promise((resolve, reject) => {
            try {
                let result = this.cronJobContainer.resumeCronJobs(request.jobCodes);
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    },

    startOnStartup: function (_self) {
        _self = _self || this;
        if (CONFIG.get('cronjob').runOnStartup) {
            _self.LOG.debug('Starting all active jobs on server start-up: ' + NODICS.getServerState());
            if (NODICS.getServerState() === 'started') {
                SERVICE.DefaultCronJobService.createJob({ tenant: 'default' }).then(response => {
                    SERVICE.DefaultCronJobService.startJob({ jobCodes: response }).then(success => {
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
                    SERVICE.DefaultCronJobService.startOnStartup(_self);
                }, 2000);
            }
        }
    },
};