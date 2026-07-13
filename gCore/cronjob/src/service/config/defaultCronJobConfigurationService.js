/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module cronjob/service/config/DefaultCronJobConfigurationService
 * @description Caches cronjob interceptor and validator configuration and supplies the default active-job query.
 * @layer service
 * @owner cronjob
 * @override Project modules may override this service to customize cronjob interceptor, validator, or eligibility resolution.
 */
module.exports = {

    interceptors: {},
    valodators: {},
    /**
     * Initializes the cronjob configuration service during service loading.
     *
     * @param {Object} options Loader options supplied during startup.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes the cronjob configuration service after service loading.
     *
     * @param {Object} options Loader options supplied during startup.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Replaces the cached job interceptor map.
     *
     * @param {Object} interceptors Interceptors keyed by job code.
     * @returns {void}
     */
    setJobInterceptors: function (interceptors) {
        this.interceptors = interceptors;
    },

    /**
     * Returns configured interceptors for a job, preparing them lazily when missing.
     *
     * @param {string} jobCode Cronjob code.
     * @returns {Object} Prepared interceptor chain.
     */
    getJobInterceptors: function (jobCode) {
        if (!this.interceptors[jobCode]) {
            this.interceptors[jobCode] = SERVICE.DefaultInterceptorConfigurationService.prepareItemInterceptors(jobCode, ENUMS.InterceptorType.job.key);
        }
        return this.interceptors[jobCode];
    },

    /**
     * Refreshes cached interceptor chains for changed jobs.
     *
     * @param {string[]} jobCodes Job codes to refresh; `default` refreshes all cached jobs.
     * @returns {void}
     */
    refreshJobInterceptors: function (jobCodes) {
        if (this.interceptors && !UTILS.isBlank(this.interceptors) && jobCodes && jobCodes.length > 0) {
            jobCodes.forEach(jobCode => {
                if (!jobCode || jobCode === 'default') {
                    let tmpInterceptors = {};
                    Object.keys(this.interceptors).forEach(jobCode => {
                        tmpInterceptors[jobCode] = SERVICE.DefaultInterceptorConfigurationService.prepareItemInterceptors(jobCode, ENUMS.InterceptorType.job.key);
                    });
                    this.interceptors = tmpInterceptors;
                } else if (this.interceptors[jobCode]) {
                    this.interceptors[jobCode] = SERVICE.DefaultInterceptorConfigurationService.prepareItemInterceptors(jobCode, ENUMS.InterceptorType.job.key);
                }
            });
        }
    },

    /**
     * Handles interceptor update events by refreshing affected job interceptor chains.
     *
     * @param {Object} request Event request containing updated job codes.
     * @param {Function} callback Node-style completion callback.
     * @returns {void}
     */
    handleJobInterceptorUpdated: function (request, callback) {
        try {
            this.refreshJobInterceptors(request.event.data);
            callback(null, { code: 'SUC_EVNT_00000' });
        } catch (error) {
            callback(new CLASSES.NodicsError(error, null, 'ERR_EVNT_00000'));
        }
    },

    /**
     * Replaces the cached tenant validator map.
     *
     * @param {Object} validators Validators keyed by tenant and job code.
     * @returns {void}
     */
    setJobValidators: function (validators) {
        this.validators = validators;
    },

    /**
     * Returns configured validators for a tenant/job pair, preparing them lazily when missing.
     *
     * @param {string} tenant Tenant code.
     * @param {string} jobCode Cronjob code.
     * @returns {Object} Prepared validator chain.
     */
    getJobValidators: function (tenant, jobCode) {
        if (!this.validators[tenant] || !this.validators[tenant][jobCode]) {
            if (!this.validators[tenant]) this.validators[tenant] = {};
            this.validators[tenant][jobCode] = SERVICE.DefaultValidatorConfigurationService.prepareItemValidators(tenant, jobCode, ENUMS.InterceptorType.schema.key);
        }
        return this.validators[tenant][jobCode];
    },

    /**
     * Refreshes cached validator chains for a tenant and changed jobs.
     *
     * @param {string} tenant Tenant code.
     * @param {string[]} jobCodes Job codes to refresh; `default` refreshes all cached jobs for the tenant.
     * @returns {void}
     */
    refreshJobValidators: function (tenant, jobCodes) {
        if (this.validators[tenant] && !UTILS.isBlank(this.validators[tenant]) && jobCodes && jobCodes.length > 0) {
            jobCodes.forEach(jobCode => {
                if (!jobCode || jobCode === 'default') {
                    let tenantValidators = {};
                    Object.keys(this.validators[tenant]).forEach(jobCode => {
                        tenantValidators[jobCode] = SERVICE.DefaultValidatorConfigurationService.prepareItemValidators(tenant, jobCode, ENUMS.InterceptorType.schema.key);
                    });
                    this.validators[tenant] = tenantValidators;
                } else if (this.validators[tenant][jobCode]) {
                    this.validators[tenant][jobCode] = SERVICE.DefaultValidatorConfigurationService.prepareItemValidators(tenant, jobCode, ENUMS.InterceptorType.schema.key);
                }
            });
        }
    },

    /**
     * Handles validator update events by refreshing affected tenant/job validator chains.
     *
     * @param {Object} request Event request containing tenant and updated job codes.
     * @param {Function} callback Node-style completion callback.
     * @returns {void}
     */
    handleJobValidatorUpdated: function (request, callback) {
        try {
            this.refreshJobValidators(request.tenant, request.event.data);
            callback(null, { code: 'SUC_EVNT_00000'});
        } catch (error) {
            callback(new CLASSES.NodicsError(error, null, 'ERR_EVNT_00000'));
        }
    },

    /**
     * Builds the default query for active jobs whose start/end windows allow scheduling.
     *
     * @returns {Object} Mongo-style query fragment for eligible jobs.
     */
    getDefaultQuery: function () {
        return {
            $and: [{
                active: true
            },
            {
                start: {
                    $lt: new Date()
                }
            },
            {
                $or: [{
                    end: {
                        $gte: new Date()
                    }
                },
                {
                    end: {
                        $exists: false
                    }
                }]
            }]
        };
    }
};
