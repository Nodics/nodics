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

    createAllJobs: function (tenants = NODICS.getActiveTenants()) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (tenants && tenants.length > 0) {
                let tenant = tenants.shift();
                this.createJob({
                    tenant: tenant
                }).then(success => {
                    _self.createAllJobs(tenants).then(success => {
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
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
                    this.cronJobContainer.createJobs({
                        tenant: request.tenant,
                        definitions: result.result
                    }).then(success => {
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
                    this.cronJobContainer.updateJobs({
                        tenant: request.tenant,
                        definitions: result.result
                    }).then(success => {
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
                    this.cronJobContainer.runJobs({
                        tenant: request.tenant,
                        definitions: result.result
                    }).then(success => {
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
        return this.cronJobContainer.startJobs(request.tenant, request.jobCodes);
    },

    stopJob: function (request) {
        return this.cronJobContainer.stopJobs(request.tenant, request.jobCodes);
    },

    removeJob: function (request) {
        return this.cronJobContainer.removeJobs(request.tenant, request.jobCodes);
    },

    pauseJob: function (request) {
        return this.cronJobContainer.pauseJobs(request.tenant, request.jobCodes);
    },

    resumeJob: function (request) {
        return this.cronJobContainer.resumeJobs(request.tenant, request.jobCodes);
    },

    startOnStartup: function (_self) {
        _self = _self || this;
        if (CONFIG.get('cronjob').runOnStartup) {
            _self.LOG.debug('Starting all active jobs on server start-up: ' + NODICS.getServerState());
            if (NODICS.getServerState() === 'started') {
                _self.createAllJobs().then(response => {
                    _self.cronJobContainer.startAllJobs().then(success => {
                        _self.LOG.debug('triggered cronjob start process : ', response);
                    }).catch(error => {
                        _self.LOG.error('Something went wrong while starting CronJobs : ', error);
                    });
                }).catch(error => {
                    if (error.code && error.code === 'ERR_JOB_00001') {
                        _self.LOG.info('No jobs found to activate');
                    } else {
                        _self.LOG.error('Something went wrong while creating CronJobs : ', error);
                    }
                });
            } else {
                _self.LOG.info('Server is not started yet, hence waiting');
                setTimeout(() => {
                    _self.startOnStartup(_self);
                }, CONFIG.get('processRetrySleepTime') || 2000);
            }
        }
    }
};