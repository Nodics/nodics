/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {

    interceptors: {},
    valodators: {},
    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    setJobInterceptors: function (interceptors) {
        this.interceptors = interceptors;
    },

    getJobInterceptors: function (jobCode) {
        if (!this.interceptors[jobCode]) {
            this.interceptors[jobCode] = SERVICE.DefaultInterceptorConfigurationService.prepareItemInterceptors(jobCode, ENUMS.InterceptorType.job.key);
        }
        return this.interceptors[jobCode];
    },

    refreshJobInterceptors: function (jobCode) {
        if (this.interceptors && !UTILS.isBlank(this.interceptors)) {
            if (!jobCode || jobCode === 'default') {
                let tmpInterceptors = {};
                Object.keys(this.interceptors).forEach(jobCode => {
                    tmpInterceptors[jobCode] = SERVICE.DefaultInterceptorConfigurationService.prepareItemInterceptors(jobCode, ENUMS.InterceptorType.job.key);
                });
                this.interceptors = tmpInterceptors;
            } else if (this.interceptors[jobCode]) {
                this.interceptors[jobCode] = SERVICE.DefaultInterceptorConfigurationService.prepareItemInterceptors(jobCode, ENUMS.InterceptorType.job.key);
            }
        }
    },

    handleJobInterceptorUpdated: function (event, callback) {
        try {
            let jobCode = event.data.item;
            this.refreshJobInterceptors(jobCode);
            callback(null, {
                code: 'SUC_EVNT_00000'
            });
        } catch (error) {
            callback(new CLASSES.NodicsError(error, null, 'ERR_EVNT_00000'));
        }
    },

    setJobValidators: function (validators) {
        this.validators = validators;
    },

    getJobValidators: function (tenant, jobCode) {
        if (!this.validators[tenant] || !this.validators[tenant][jobCode]) {
            if (!this.validators[tenant]) this.validators[tenant] = {};
            this.validators[tenant][jobCode] = SERVICE.DefaultValidatorConfigurationService.prepareItemValidators(tenant, jobCode, ENUMS.InterceptorType.schema.key);
        }
        return this.validators[tenant][jobCode];
    },

    refreshJobValidators: function (tenant, jobCode) {
        if (this.validators[tenant] && !UTILS.isBlank(this.validators[tenant])) {
            if (!jobCode || jobCode === 'default') {
                let tenantValidators = {};
                Object.keys(this.validators[tenant]).forEach(jobCode => {
                    tenantValidators[jobCode] = SERVICE.DefaultValidatorConfigurationService.prepareItemValidators(tenant, jobCode, ENUMS.InterceptorType.schema.key);
                });
                this.validators[tenant] = tenantValidators;
            } else if (this.validators[tenant][jobCode]) {
                this.validators[tenant][jobCode] = SERVICE.DefaultValidatorConfigurationService.prepareItemValidators(tenant, jobCode, ENUMS.InterceptorType.schema.key);
            }
        }
    },

    handleJobValidatorUpdated: function (event, callback) {
        try {
            this.refreshJobValidators(event.data.tenant, event.data.item);
            callback(null, {
                code: 'SUC_EVNT_00000'
            });
        } catch (error) {
            callback(new CLASSES.NodicsError(error, null, 'ERR_EVNT_00000'));
        }
    },

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