/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

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

    validateRequest: function (request, response, process) {
        if (!request.moduleName) {
            process.error(request, response, 'Invalid moduleName');
        } else {
            process.nextSuccess(request, response);
        }
    },

    handleResponsibilities: function (request, response, process) {
        this.startTenantSpecificJobs(request.remoteNode, NODICS.getActiveTenants()).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    startTenantSpecificJobs: function (remoteNode, tenants) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (tenants && tenants.length > 0) {
                let tenant = tenants.shift();
                SERVICE.DefaultCronJobService.get({
                    tenant: tenant,
                    options: {
                        noLimit: true,
                        projection: { _id: 0 }
                    },
                    query: _.merge({
                        runOnNode: remoteNode
                    }, CONFIG.get('cronjob').activeJobsQuery)
                }).then(result => {
                    if (result.success && result.result && result.result.length > 0) {
                        this.cronJobContainer.createJobs({
                            tenant: request.tenant,
                            definitions: result.result
                        }).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    } else {
                        _self.LOG.info('None jobs found for tenant: ' + tenant);
                        resolve(true);
                    }
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    },

    handleSucessEnd: function (request, response, process) {
        response.success.msg = SERVICE.DefaultStatusService.get(response.success.code || 'SUC_SYS_00000').message;
        process.resolve(response.success);
    },

    handleErrorEnd: function (request, response, process) {
        if (response.errors && response.errors.length === 1) {
            process.reject(response.errors[0]);
        } else if (response.errors && response.errors.length > 1) {
            process.reject({
                success: false,
                code: 'ERR_SYS_00000',
                error: response.errors
            });
        } else {
            process.reject(response.error);
        }
    }
};