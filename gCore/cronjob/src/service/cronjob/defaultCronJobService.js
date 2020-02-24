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

    // getTenantActiveJobs: function (tenants, jobCodes) {
    //     return new Promise((resolve, reject) => {
    //         if (!jobCodes) jobCodes = {};
    //         if (tenants && tenants.length > 0) {
    //             let tenant = tenants.shift();
    //             if (!jobCodes[tenant]) jobCodes[tenant] = [];
    //             SERVICE.DefaultCronJobService.get({
    //                 tenant: tenant,
    //                 options: { noLimit: true },
    //                 query: _.merge({
    //                     runOnNode: CONFIG.get('nodeId')
    //                 }, SERVICE.DefaultCronJobConfigurationService.getDefaultQuery())
    //             }).then(result => {
    //                 if (result.result && result.result.length >= 0) {
    //                     result.result.forEach(job => {
    //                         if (!jobCodes[tenant].includes(job.code)) jobCodes[tenant].push(job.code);
    //                     });
    //                 }
    //                 this.getTenantActiveJobs(tenants, jobCodes).then(jobCodes => {
    //                     resolve(jobCodes);
    //                 }).catch(error => {
    //                     reject(error);
    //                 });
    //             }).catch(error => {
    //                 reject(error);
    //             });
    //         } else {
    //             resolve(jobCodes);
    //         }
    //     });
    // },

    getTenantsJobs: function (options, tenants = NODICS.getActiveTenants(), jobs = {}) {
        return new Promise((resolve, reject) => {
            if (tenants && tenants.length > 0) {
                SERVICE.DefaultCronJobService.get({
                    tenant: tenants.shift(),
                    options: options.options || {},
                    query: options.query || {}
                }).then(result => {
                    if (result.result && result.result.length > 0) {
                        result.result.forEach(job => {
                            job.tenant = job.tenant || tenant;
                            jobs.push(job);
                        });
                    }
                    this.getTenantsJobs(query, tenants, jobs).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(jobs);
            }
        });
    },

    createAllJobs: function (tenants = NODICS.getActiveTenants()) {
        return new Promise((resolve, reject) => {
            this.getTenantsJobs({
                options: {
                    noLimit: true,
                    projection: { _id: 0 }
                },
                query: SERVICE.DefaultCronJobConfigurationService.getDefaultQuery()
            }, tenants).then(jobs => {
                this.cronJobContainer.createJobs({
                    tenant: request.tenant,
                    definitions: jobs
                }).then(success => {
                    let code = 'SUC_JOB_00000';
                    if (success.result.length > 0 && success.failed.length > 0) {
                        code = 'SUC_JOB_00001';
                    } else if (success.result.length <= 0 && success.failed.length > 0) {
                        code = 'ERR_JOB_00000';
                    }
                    resolve(_.merge({ code: code }, success));
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    },

    createJob: function (request) {
        return new Promise((resolve, reject) => {
            this.getTenantsJobs({
                options: _.merge({
                    noLimit: true,
                    projection: { _id: 0 }
                }, request.options),
                query: _.merge(SERVICE.DefaultCronJobConfigurationService.getDefaultQuery(), request.query)
            }, [request.tenant]).then(jobs => {
                this.cronJobContainer.createJobs({
                    tenant: request.tenant,
                    definitions: jobs
                }).then(success => {
                    let code = 'SUC_JOB_00000';
                    if (success.result.length > 0 && success.failed.length > 0) {
                        code = 'SUC_JOB_00001';
                    } else if (success.result.length <= 0 && success.failed.length > 0) {
                        code = 'ERR_JOB_00000';
                    }
                    resolve(_.merge({ code: code }, success));
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });

    },

    updateJob: function (request) {
        return new Promise((resolve, reject) => {
            this.getTenantsJobs({
                options: _.merge({
                    noLimit: true,
                    projection: { _id: 0 }
                }, request.options),
                query: _.merge(SERVICE.DefaultCronJobConfigurationService.getDefaultQuery(), request.query)
            }, [request.tenant]).then(jobs => {
                this.cronJobContainer.updateJobs({
                    tenant: request.tenant,
                    definitions: jobs
                }).then(success => {
                    let code = 'SUC_JOB_00000';
                    if (success.result.length > 0 && success.failed.length > 0) {
                        code = 'SUC_JOB_00001';
                    } else if (success.result.length <= 0 && success.failed.length > 0) {
                        code = 'ERR_JOB_00000';
                    }
                    resolve(_.merge({ code: code }, success));
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    },

    runJob: function (request) {
        return new Promise((resolve, reject) => {
            this.getTenantsJobs({
                options: _.merge({
                    noLimit: true,
                    projection: { _id: 0 }
                }, request.options),
                query: _.merge(SERVICE.DefaultCronJobConfigurationService.getDefaultQuery(), request.query)
            }, [request.tenant]).then(jobs => {
                this.cronJobContainer.runJobs({
                    tenant: request.tenant,
                    definitions: jobs
                }).then(success => {
                    let code = 'SUC_JOB_00000';
                    if (success.result.length > 0 && success.failed.length > 0) {
                        code = 'SUC_JOB_00001';
                    } else if (success.result.length <= 0 && success.failed.length > 0) {
                        code = 'ERR_JOB_00000';
                    }
                    resolve(_.merge({ code: code }, success));
                }).catch(error => {
                    reject(error);
                });
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
                        _self.LOG.debug('triggered cronjob start process : ' + response);
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