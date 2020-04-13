/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

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

    prepareURL: function (definition) {
        let connectionType = 'abstract';
        let nodeId = 'node0';
        if (definition.targetNodeId) {
            connectionType = 'node';
            nodeId = definition.targetNodeId;
        }
        return SERVICE.DefaultModuleService.buildRequest({
            connectionType: connectionType,
            nodeId: nodeId,
            moduleName: 'workflow',
            methodName: 'put',
            apiName: '/item/init',
            requestBody: definition.requestBody,
            responseType: true,
            header: {
                authToken: NODICS.getInternalAuthToken(definition.tenant)
            }
        });
    },

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
