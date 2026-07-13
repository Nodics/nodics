/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module cronjob/service/node/DefaultCronJobNodeUpHandlerService
 * @description Releases temporary cronjob responsibility when a remote node comes back online.
 * @layer service
 * @owner cronjob
 * @override Project modules may override this handler to customize responsibility restoration.
 */
module.exports = {
    /**
     * Initializes the node-up handler during service loading.
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
     * Finalizes the node-up handler after service loading.
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
     * Validates node-up pipeline input before temporary jobs are removed.
     *
     * @param {Object} request Pipeline request containing module name and remote data.
     * @param {Object} response Pipeline response.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     */
    validateRequest: function (request, response, process) {
        if (!request.moduleName) {
            process.error(request, response, new CLASSES.NodicsError('ERR_JOB_00003', 'Invalid moduleName'));
        } else if (!request.remoteData) {
            process.error(request, response, new CLASSES.NodicsError('ERR_JOB_00003', 'Invalid data object'));
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**
     * Removes jobs that were temporarily owned while the remote node was down.
     *
     * @param {Object} request Pipeline request containing remote job data.
     * @param {Object} response Pipeline response.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     */
    shutdownResponsibilities: function (request, response, process) {
        this.removeRemoteJobs(NODICS.getActiveTenants(), request.remoteData).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    /**
     * Recursively removes temporarily owned jobs for active tenants.
     *
     * @param {string[]} tenants Tenants to process.
     * @param {Object} remoteData Job-code map by tenant.
     * @returns {Promise<boolean>} Resolves after temporary jobs are removed.
     */
    removeRemoteJobs: function (tenants, remoteData) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (tenants && tenants.length > 0) {
                let tenant = tenants.shift();
                let jobCodes = remoteData[tenant];
                SERVICE.DefaultCronJobService.removeJob({
                    tenant: tenant,
                    jobCodes: jobCodes
                }).then(success => {
                    _self.removeRemoteJobs(tenants, remoteData).then(success => {
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    }
};
