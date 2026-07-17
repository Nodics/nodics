/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module cronjob/service/node/DefaultCronJobNodeDownHandlerService
 * @description Handles cronjob responsibility takeover when a remote node goes down.
 * @layer service
 * @owner cronjob
 * @override Project modules may override this handler to customize failover ownership and restart behavior.
 */
module.exports = {
    /**
     * Initializes the node-down handler during service loading.
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
     * Finalizes the node-down handler after service loading.
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
     * Validates node-down pipeline input before responsibility takeover.
     *
     * @param {Object} request Pipeline request containing module name and remote node.
     * @param {Object} response Pipeline response.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     */
    validateRequest: function (request, response, process) {
        if (!request.moduleName) {
            process.error(request, response, new CLASSES.NodicsError('ERR_JOB_00003', 'Invalid moduleName'));
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**
     * Starts jobs previously assigned to a down remote node on the current node.
     *
     * @param {Object} request Pipeline request containing module and remote node details.
     * @param {Object} response Pipeline response receiving success data.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     */
    handleResponsibilities: function (request, response, process) {
        this.startTenantSpecificJobs(request.moduleName, request.remoteNode, NODICS.getActiveTenants()).then(success => {
            response.success = success;
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    /**
     * Loads eligible jobs for a remote node and starts temporary local scheduler ownership.
     *
     * @param {string} moduleName Module whose node map owns the remote node.
     * @param {string} remoteNode Remote node identifier that went down.
     * @param {string[]} tenants Tenants to scan for jobs.
     * @returns {Promise<Object>} Creation and start results.
     */
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
