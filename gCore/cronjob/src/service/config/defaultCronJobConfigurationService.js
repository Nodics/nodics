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

    getJobInterceptors: function (jobCode) {
        if (!this.interceptors[jobCode]) {
            this.interceptors[jobCode] = SERVICE.DefaultInterceptorConfigurationService.prepareItemInterceptors(jobCode, ENUMS.InterceptorType.job.key);
        }
        return this.interceptors[jobCode];
    },

    refreshJobInterceptors: function () {
        if (this.interceptors && !UTILS.isBlank(this.interceptors)) {
            Object.keys(this.interceptors).forEach(jobCode => {
                this.interceptors[jobCode] = SERVICE.DefaultInterceptorConfigurationService.prepareItemInterceptors(jobCode, ENUMS.InterceptorType.job.key);
            });
        }
    },

    getJobValidators: function (tenant, jobCode) {
        if (this.interceptors &&
            !UTILS.isBlank(this.valodators[tenant]) &&
            !UTILS.isBlank(this.valodators[tenant][jobCode])) {
            return this.valodators[tenant][jobCode];
        } else {
            return null;
        }
    },

    // prepareJobInterceptors: function () {
    //     return new Promise((resolve, reject) => {
    //         let items = [];
    //         SERVICE.DefaultCronJobService.getTenantActiveJobs(NODICS.getActiveTenants()).then(jobCodes => {
    //             Object.keys(jobCodes).forEach(tenant => {
    //                 jobCodes[tenant].forEach(jobCode => {
    //                     if (!items.includes(jobCode)) items.push(jobCode);
    //                 });
    //             });
    //             SERVICE.DefaultInterceptorConfigurationService.prepareInterceptors(
    //                 items,
    //                 ENUMS.InterceptorType.job.key
    //             ).then(jobInterceptors => {
    //                 this.interceptors = jobInterceptors;
    //                 resolve(true);
    //             }).catch(error => {
    //                 reject(error);
    //             });
    //         }).catch(error => {
    //             reject(error);
    //         });
    //     });
    // },

    // buildJobValidators: function (jobCodes, validators, tenants = NODICS.getActiveTenants()) {
    //     if (!validators) validators = {};
    //     return new Promise((resolve, reject) => {
    //         if (tenants && tenants.length > 0) {
    //             let tenant = tenants.shift();
    //             SERVICE.DefaultValidatorConfigurationService.prepareValidators(
    //                 tenant,
    //                 jobCodes[tenant],
    //                 ENUMS.ValidatorType.job.key
    //             ).then(jobValidators => {
    //                 validators[tenant] = jobValidators;
    //                 this.buildJobValidators(jobCodes, validators, tenants).then(validators => {
    //                     resolve(validators);
    //                 }).catch(error => {
    //                     reject(error);
    //                 });
    //             }).catch(error => {
    //                 reject(error);
    //             });
    //         } else {
    //             resolve(validators);
    //         }
    //     });
    // },

    // prepareJobValidators: function () {
    //     return new Promise((resolve, reject) => {
    //         SERVICE.DefaultCronJobService.getTenantActiveJobs(NODICS.getActiveTenants()).then(jobCodes => {
    //             this.buildJobValidators(jobCodes).then(jobInterceptors => {
    //                 this.valodators = jobInterceptors;
    //                 resolve(true);
    //             }).catch(error => {
    //                 reject(error);
    //             });
    //         }).catch(error => {
    //             reject(error);
    //         });
    //     });
    // },

    // getDefaultQuery: function () {
    //     return {
    //         $and: [{
    //             active: true
    //         },
    //         {
    //             start: {
    //                 $lt: new Date()
    //             }
    //         },
    //         {
    //             $or: [{
    //                 end: {
    //                     $gte: new Date()
    //                 }
    //             },
    //             {
    //                 end: {
    //                     $exists: false
    //                 }
    //             }]
    //         }]
    //     };
    // }
};