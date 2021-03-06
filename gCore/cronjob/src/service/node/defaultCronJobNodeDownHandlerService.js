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

    validateRequest: function (request, response, process) {
        if (!request.moduleName) {
            process.error(request, response, new CLASSES.NodicsError('ERR_JOB_00003', 'Invalid moduleName'));
        } else {
            process.nextSuccess(request, response);
        }
    },

    handleResponsibilities: function (request, response, process) {
        this.startTenantSpecificJobs(request.moduleName, request.remoteNode, NODICS.getActiveTenants()).then(success => {
            response.success = success;
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    startTenantSpecificJobs: function (moduleName, remoteNode, tenants) {
        let _self = this;
        return new Promise((resolve, reject) => {
            let output = {};
            SERVICE.DefaultCronJobService.getTenantsJobs({
                searchOptions: {
                    noLimit: true,
                    projection: { _id: 0 }
                },
                query: _.merge({
                    runOnNode: remoteNode
                }, SERVICE.DefaultCronJobConfigurationService.getDefaultQuery())
            }, tenants).then(jobs => {
                let allJobCodes = [];
                let moduleObject = NODICS.getModule(moduleName);
                let nodeConfig = moduleObject.nms.nodes[remoteNode];
                if (!nodeConfig.remoteData) {
                    nodeConfig.remoteData = {};
                }
                nodeConfig.remoteData[tenant] = [];
                jobs.forEach(job => {
                    nodeConfig.remoteData[job.tenant].push(job.code);
                    job.tempNode = CONFIG.get('nodeId');
                    allJobCodes.push(job.code);
                });
                SERVICE.DefaultCronJobService.getCronJobContainer().createJobs({
                    tenant: request.tenant,
                    definitions: jobs
                }).then(success => {
                    output.createJobs = success;
                    SERVICE.DefaultCronJobService.getCronJobContainer().startAllJobs(allJobCodes, tenants).then(success => {
                        output.startJobs = success;
                        resolve(output);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    }
};