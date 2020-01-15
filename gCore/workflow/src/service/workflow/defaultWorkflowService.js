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

    assignItemsToWorkflow: function (itemDetails) {
        return new Promise((resolve, reject) => {
            if (itemDetails && itemDetails.length > 0) {
                let itemDetail = itemDetails.shift();
                SERVICE.DefaultPipelineService.start('assignWorkflowItemPipeline', {
                    tenant: itemDetail.tenant,
                    itemCode: itemDetail.itemCode,
                    schemaName: itemDetail.schemaName,
                    indexName: itemDetail.indexName,
                    moduleName: itemDetail.moduleName,
                    workflowCode: itemDetail.workflowCode
                }, {}).then(success => {
                    this.assignItemToWorkflow(itemDetails).then(success => {
                        resolve(success);
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
    },

    addItems: function (request) {
        if (!(request.items instanceof Array)) {
            request.items = [request.items];
        }
        return this.assignItemToWorkflow(request.items).then(success => {
            resolve(success);
        }).catch(error => {
            reject(error);
        });
    },

    startWorkflow: function (request) {
        return new Promise((resolve, reject) => {
            SERVICE.DefaultPipelineService.start('performWorkflowActionPipeline', {
                tenant: request.tenant,
                itemCode: request.itemCode,
                actionResponse: request.actionResponse
            }, {}).then(success => {
                resolve(success);
            }).catch(error => {
                reject(error);
            });
        });
    },

    performAction: function (request) {
        return new Promise((resolve, reject) => {
            SERVICE.DefaultPipelineService.start('performWorkflowActionPipeline', {
                tenant: request.tenant,
                itemCode: request.itemCode,
                actionResponse: request.actionResponse
            }, {}).then(success => {
                resolve(success);
            }).catch(error => {
                reject(error);
            });
        });
    },

    removeItem: function (request) {
        return SERVICE.DefaultWorkflowService.removeItem(request);
    },

    disableItem: function (request) {
        return SERVICE.DefaultWorkflowService.disableItem(request);
    },

    resumeItem: function (request) {
        return SERVICE.DefaultWorkflowService.resumeItem(request);
    }
};
