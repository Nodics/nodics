/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {

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
        let interceptors = SERVICE.DefaultInterceptorConfigurationService.getTypeInterceptors(ENUMS.InterceptorType.job.key);
        if (interceptors && !UTILS.isBlank(interceptors)) {
            return interceptors[jobCode];
        } else {
            return null;
        }
    },

    getActiveJobs: function () {
        return new Promise((resolve, reject) => {
            SERVICE.DefaultCronJobService.get({
                tenant: 'default',
                options: {
                    noLimit: true
                },
                query: _.merge({
                    runOnNode: CONFIG.get('nodeId')
                }, SERVICE.DefaultCronJobConfigurationService.getDefaultQuery())
            }).then(result => {
                if (result.success && result.result && result.result.length >= 0) {
                    resolve(result.result);
                } else {
                    reject(result.msg);
                }
            }).catch(error => {
                reject(error);
            });
        });
    },

    prepareJobInterceptors: function () {
        return new Promise((resolve, reject) => {
            let items = [];
            this.getActiveJobs().then(jobs => {
                jobs.forEach(job => {
                    items.push(job.code);
                });
                console.log('------------->>> ', items);
                SERVICE.DefaultInterceptorConfigurationService.prepareInterceptors(
                    items,
                    ENUMS.InterceptorType.job.key
                ).then(jobInterceptors => {
                    console.log('-------------> ', jobInterceptors);
                    this.interceptors = jobInterceptors;
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
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