/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module cronjob/service/cronjob/DefaultCronJobService
 * @description Coordinates persisted cronjob definitions with the in-memory scheduler container across tenants.
 * @layer service
 * @owner cronjob
 * @override Project modules may override this service to customize job eligibility, tenant traversal, or lifecycle orchestration.
 */
module.exports = {

    cronJobContainer: new CLASSES.CronJobContainer(),

    /**
     * Returns the process-local cronjob container.
     *
     * @returns {Object} Cronjob container instance.
     */
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

    /**
     * Loads jobs for each tenant recursively and annotates jobs with their tenant.
     *
     * @param {Object} options Search options and query used to load persisted jobs.
     * @param {string[]} tenants Tenant codes to scan.
     * @param {Object[]} jobs Accumulator for loaded jobs.
     * @returns {Promise<Object[]>} Jobs found across tenants.
     */
    getTenantsJobs: function (options, tenants = NODICS.getActiveTenants(), jobs = []) {
        return new Promise((resolve, reject) => {
            if (tenants && tenants.length > 0) {
                let tenant = tenants.shift();
                SERVICE.DefaultCronJobService.get({
                    tenant: tenant,
                    options: options.options || {},
                    query: options.query || {}
                }).then(result => {
                    if (result.result && result.result.length > 0) {
                        result.result.forEach(job => {
                            job.tenant = job.tenant || tenant;
                            jobs.push(job);
                        });
                    }
                    this.getTenantsJobs(options, tenants, jobs).then(success => {
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

    /**
     * Creates scheduler instances for all eligible jobs across active tenants.
     *
     * @param {string[]} tenants Tenant codes to scan.
     * @returns {Promise<Object>} Aggregate creation result.
     */
    createAllJobs: function (tenants = NODICS.getActiveTenants()) {
        return new Promise((resolve, reject) => {
            const activeTenants = tenants.slice();
            this.getTenantsJobs({
                searchOptions: {
                    noLimit: true,
                    projection: { _id: 0 }
                },
                query: SERVICE.DefaultCronJobConfigurationService.getDefaultQuery()
            }, activeTenants.slice()).then(jobs => {
                this.cronJobContainer.createJobs({
                    tenants: activeTenants,
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

    /**
     * Creates scheduler instances for persisted jobs matching the request query.
     *
     * @param {Object} request Cronjob lifecycle request containing tenant and query.
     * @returns {Promise<Object>} Aggregate creation result.
     */
    createJob: function (request) {
        return new Promise((resolve, reject) => {
            this.getTenantsJobs({
                searchOptions: _.merge({
                    noLimit: true,
                    projection: { _id: 0 }
                }, request.searchOptions),
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

    /**
     * Refreshes scheduler instances from persisted jobs matching the request query.
     *
     * @param {Object} request Cronjob lifecycle request containing tenant and query.
     * @returns {Promise<Object>} Aggregate update result.
     */
    updateJob: function (request) {
        return new Promise((resolve, reject) => {
            this.getTenantsJobs({
                searchOptions: _.merge({
                    noLimit: true,
                    projection: { _id: 0 }
                }, request.searchOptions),
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

    /**
     * Runs persisted jobs matching the request query once immediately.
     *
     * @param {Object} request Cronjob lifecycle request containing tenant and query.
     * @returns {Promise<Object>} Aggregate run result.
     */
    runJob: function (request) {
        return new Promise((resolve, reject) => {
            this.getTenantsJobs({
                searchOptions: _.merge({
                    noLimit: true,
                    projection: { _id: 0 }
                }, request.searchOptions),
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

    /**
     * Starts jobs already present in the tenant scheduler pool.
     *
     * @param {Object} request Cronjob lifecycle request containing tenant and job codes.
     * @returns {Promise<Object>} Aggregate start result.
     */
    startJob: function (request) {
        return this.cronJobContainer.startJobs(request.tenant, request.jobCodes);
    },

    /**
     * Stops jobs already present in the tenant scheduler pool.
     *
     * @param {Object} request Cronjob lifecycle request containing tenant and job codes.
     * @returns {Promise<Object>} Aggregate stop result.
     */
    stopJob: function (request) {
        return this.cronJobContainer.stopJobs(request.tenant, request.jobCodes);
    },

    /**
     * Removes jobs from the tenant scheduler pool.
     *
     * @param {Object} request Cronjob lifecycle request containing tenant and job codes.
     * @returns {Promise<Object>} Aggregate removal result.
     */
    removeJob: function (request) {
        return this.cronJobContainer.removeJobs(request.tenant, request.jobCodes);
    },

    /**
     * Pauses jobs already present in the tenant scheduler pool.
     *
     * @param {Object} request Cronjob lifecycle request containing tenant and job codes.
     * @returns {Promise<Object>} Aggregate pause result.
     */
    pauseJob: function (request) {
        return this.cronJobContainer.pauseJobs(request.tenant, request.jobCodes);
    },

    /**
     * Resumes jobs already present in the tenant scheduler pool.
     *
     * @param {Object} request Cronjob lifecycle request containing tenant and job codes.
     * @returns {Promise<Object>} Aggregate resume result.
     */
    resumeJob: function (request) {
        return this.cronJobContainer.resumeJobs(request.tenant, request.jobCodes);
    },

    /**
     * Starts all eligible jobs once the server has reached the started state.
     *
     * @param {Object} [_self] Optional service instance for retry callbacks.
     * @returns {void}
     * @sideEffects Polls server state, creates eligible jobs, and starts all jobs when enabled.
     */
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
