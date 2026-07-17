/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module cronjob/controller/DefaultCronJobController
 * @description Adapts secured cronjob API requests into facade calls for job lifecycle operations.
 * @layer controller
 * @owner cronjob
 * @override Project modules may override this controller to add request policy or custom job lifecycle endpoints.
 */
module.exports = {

    /**
     * Creates one or more active jobs in the in-memory scheduler pool.
     *
     * @param {Object} request Nodics request context with HTTP params/body and tenant.
     * @param {Function} [callback] Optional Node-style callback.
     * @returns {Promise<Object>|void} Promise when no callback is supplied.
     */
    createJob: function (request, callback) {
        request = _.merge(request || {}, request.httpRequest.body);
        request.options = request.options || {};
        if (!request.options.recursive) {
            request.options.recursive = request.httpRequest.get('recursive') || false;
        }
        if (request.httpRequest.params.jobCode) {
            request.query = {
                code: request.httpRequest.params.jobCode
            };
        }
        if (!UTILS.isBlank(request.query)) {
            if (callback) {
                FACADE.DefaultCronJobFacade.createJob(request).then(success => {
                    callback(null, success);
                }).catch(error => {
                    callback(error);
                });
            } else {
                return FACADE.DefaultCronJobFacade.createJob(request);
            }
        } else {
            this.LOG.error('Please validate your request, it is not a valid one');
            let error = new CLASSES.CronJobError('ERR_JOB_00003', 'for create job');
            if (callback) {
                callback(error);
            } else {
                return Promise.reject(error);
            }
        }
    },

    /**
     * Refreshes one or more jobs in the scheduler pool from persisted job definitions.
     *
     * @param {Object} request Nodics request context with HTTP params/body and tenant.
     * @param {Function} [callback] Optional Node-style callback.
     * @returns {Promise<Object>|void} Promise when no callback is supplied.
     */
    updateJob: function (request, callback) {
        request = _.merge(request || {}, request.httpRequest.body);
        request.options = request.options || {};
        if (!request.options.recursive) {
            request.options.recursive = request.httpRequest.get('recursive') || false;
        }
        if (request.httpRequest.params.jobCode) {
            request.query = {
                code: request.httpRequest.params.jobCode
            };
        }

        if (!UTILS.isBlank(request.query)) {
            if (callback) {
                FACADE.DefaultCronJobFacade.updateJob(request).then(success => {
                    callback(null, success);
                }).catch(error => {
                    callback(error);
                });
            } else {
                return FACADE.DefaultCronJobFacade.updateJob(request);
            }
        } else {
            this.LOG.error('Please validate your request, it is not a valid one');
            let error = new CLASSES.CronJobError('ERR_JOB_00003', 'for update job');
            if (callback) {
                callback(error);
            } else {
                return Promise.reject(error);
            }
        }
    },

    /**
     * Runs a job once immediately without relying on its normal schedule.
     *
     * @param {Object} request Nodics request context containing `jobCode` route params.
     * @param {Function} [callback] Optional Node-style callback.
     * @returns {Promise<Object>|void} Promise when no callback is supplied.
     */
    runJob: function (request, callback) {
        if (request.httpRequest.params.jobCode) {
            request.query = {
                code: request.httpRequest.params.jobCode
            };
        }
        if (!UTILS.isBlank(request.query)) {
            if (callback) {
                FACADE.DefaultCronJobFacade.runJob(request).then(success => {
                    callback(null, success);
                }).catch(error => {
                    callback(error);
                });
            } else {
                return FACADE.DefaultCronJobFacade.runJob(request);
            }
        } else {
            this.LOG.error('Please validate your request, it is not a valid one');
            let error = new CLASSES.CronJobError('ERR_JOB_00003', 'for run job');
            if (callback) {
                callback(error);
            } else {
                return Promise.reject(error);
            }
        }
    },

    /**
     * Starts one or more jobs already present in the scheduler pool.
     *
     * @param {Object} request Nodics request context containing a `jobCode` param or body array.
     * @param {Function} [callback] Optional Node-style callback.
     * @returns {Promise<Object>|void} Promise when no callback is supplied.
     */
    startJob: function (request, callback) {
        request.jobCodes = [];
        if (request.httpRequest.params.jobCode) {
            request.jobCodes.push(request.httpRequest.params.jobCode);
        } else if (request.httpRequest.body instanceof Array) {
            request.jobCodes = request.httpRequest.body;
        }
        if (request.jobCodes.length > 0) {
            if (callback) {
                FACADE.DefaultCronJobFacade.startJob(request).then(success => {
                    callback(null, success);
                }).catch(error => {
                    callback(error);
                });
            } else {
                return FACADE.DefaultCronJobFacade.startJob(request);
            }
        } else {
            this.LOG.error('Please validate your request, it is not a valid one');
            let error = new CLASSES.CronJobError('ERR_JOB_00003', 'for start job');
            if (callback) {
                callback(error);
            } else {
                return Promise.reject(error);
            }
        }
    },

    /**
     * Stops one or more active jobs in the scheduler pool.
     *
     * @param {Object} request Nodics request context containing a `jobCode` param or body array.
     * @param {Function} [callback] Optional Node-style callback.
     * @returns {Promise<Object>|void} Promise when no callback is supplied.
     */
    stopJob: function (request, callback) {
        request.jobCodes = [];
        if (request.httpRequest.params.jobCode) {
            request.jobCodes.push(request.httpRequest.params.jobCode);
        } else if (request.httpRequest.body instanceof Array) {
            request.jobCodes = request.httpRequest.body;
        }
        if (request.jobCodes.length > 0) {
            if (callback) {
                FACADE.DefaultCronJobFacade.stopJob(request).then(success => {
                    callback(null, success);
                }).catch(error => {
                    callback(error);
                });
            } else {
                return FACADE.DefaultCronJobFacade.stopJob(request);
            }
        } else {
            this.LOG.error('Please validate your request, it is not a valid one');
            let error = new CLASSES.CronJobError('ERR_JOB_00003', 'for stop job');
            if (callback) {
                callback(error);
            } else {
                return Promise.reject(error);
            }
        }
    },

    /**
     * Stops and removes one or more jobs from the scheduler pool.
     *
     * @param {Object} request Nodics request context containing a `jobCode` param or body array.
     * @param {Function} [callback] Optional Node-style callback.
     * @returns {Promise<Object>|void} Promise when no callback is supplied.
     */
    removeJob: function (request, callback) {
        request.jobCodes = [];
        if (request.httpRequest.params.jobCode) {
            request.jobCodes.push(request.httpRequest.params.jobCode);
        } else if (request.httpRequest.body instanceof Array) {
            request.jobCodes = request.httpRequest.body;
        }
        if (request.jobCodes.length > 0) {
            if (callback) {
                FACADE.DefaultCronJobFacade.removeJob(request).then(success => {
                    callback(null, success);
                }).catch(error => {
                    callback(error);
                });
            } else {
                return FACADE.DefaultCronJobFacade.removeJob(request);
            }
        } else {
            this.LOG.error('Please validate your request, it is not a valid one');
            let error = new CLASSES.CronJobError('ERR_JOB_00003', 'for remove job');
            if (callback) {
                callback(error);
            } else {
                return Promise.reject(error);
            }
        }
    },

    /**
     * Pauses one or more active jobs without removing them from the scheduler pool.
     *
     * @param {Object} request Nodics request context containing a `jobCode` param or body array.
     * @param {Function} [callback] Optional Node-style callback.
     * @returns {Promise<Object>|void} Promise when no callback is supplied.
     */
    pauseJob: function (request, callback) {
        request.jobCodes = [];
        if (request.httpRequest.params.jobCode) {
            request.jobCodes.push(request.httpRequest.params.jobCode);
        } else if (request.httpRequest.body instanceof Array) {
            request.jobCodes = request.httpRequest.body;
        }
        if (request.jobCodes.length > 0) {
            if (callback) {
                FACADE.DefaultCronJobFacade.pauseJob(request).then(success => {
                    callback(null, success);
                }).catch(error => {
                    callback(error);
                });
            } else {
                return FACADE.DefaultCronJobFacade.pauseJob(request);
            }
        } else {
            this.LOG.error('Please validate your request, it is not a valid one');
            let error = new CLASSES.CronJobError('ERR_JOB_00003', 'for pause job');
            if (callback) {
                callback(error);
            } else {
                return Promise.reject(error);
            }
        }
    },

    /**
     * Resumes one or more paused jobs in the scheduler pool.
     *
     * @param {Object} request Nodics request context containing a `jobCode` param or body array.
     * @param {Function} [callback] Optional Node-style callback.
     * @returns {Promise<Object>|void} Promise when no callback is supplied.
     */
    resumeJob: function (request, callback) {
        request.jobCodes = [];
        if (request.httpRequest.params.jobCode) {
            request.jobCodes.push(request.httpRequest.params.jobCode);
        } else if (request.httpRequest.body instanceof Array) {
            request.jobCodes = request.httpRequest.body;
        }
        if (request.jobCodes.length > 0) {
            if (callback) {
                FACADE.DefaultCronJobFacade.resumeJob(request).then(success => {
                    callback(null, success);
                }).catch(error => {
                    callback(error);
                });
            } else {
                return FACADE.DefaultCronJobFacade.resumeJob(request);
            }
        } else {
            this.LOG.error('Please validate your request, it is not a valid one');
            let error = new CLASSES.CronJobError('ERR_JOB_00003', 'for resume job');
            if (callback) {
                callback(error);
            } else {
                return Promise.reject(error);
            }
        }
    }
};
