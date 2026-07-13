/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module gFramework/nbpm/src/service/workflow/defaultWorkflowService
 * @description Implements nbpm default workflow service business behavior and extension logic.
 * @layer service
 * @owner nbpm
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    dbs: {},
    interceptors: {},

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

    /**

     * Runs pre-processing logic for pare url.

     *

     * @param {*} definition Method input.

     * @returns {*} Method result.

     */

    prepareURL: function (definition) {
        let connectionType = 'abstract';
        let nodeId = CONFIG.get('nodeId');
        if (definition.targetNodeId) {
            connectionType = 'node';
            nodeId = definition.targetNodeId;
        }
        return SERVICE.DefaultModuleService.buildRequest({
            connectionType: connectionType,
            nodeId: nodeId,
            moduleName: CONFIG.get('workflowModuleName') || 'workflow',
            methodName: 'put',
            apiName: '/item/init',
            requestBody: definition.requestBody,
            responseType: true,
            header: {
                Authorization: 'Bearer ' + NODICS.getInternalAuthToken(definition.tenant)
            }
        });
    },

    /**

     * Processes to workflow behavior.

     *

     * @param {*} itemDetails Method input.

     * @param {*} tenant Method input.

     * @returns {*} Method result.

     */

    publishToWorkflow: function (itemDetails, tenant) {
        return new Promise((resolve, reject) => {
            if (NODICS.isModuleActive('workflow')) {
                this.initializeWorkflows({
                    items: itemDetails
                }).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } else {
                SERVICE.DefaultModuleService.fetch(this.prepareURL({
                    tenant: tenant,
                    requestBody: itemDetails
                })).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            }
        });
    }
};
