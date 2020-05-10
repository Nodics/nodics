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

    handleWorkflowProcess: function (request, response, process) {
        try {
            let schemaModel = request.schemaModel;
            let removedModels = response.success.result.models;
            if (!request.ignoreWorkflowEvent && removedModels && removedModels.length > 0 && schemaModel.workflowCodes && schemaModel.workflowCodes.length > 0) {
                this.LOG.debug('Triggering event for workflow association');
                let event = {
                    tenant: request.tenant,
                    event: 'initiateWorkflow',
                    sourceName: schemaModel.moduleName,
                    sourceId: CONFIG.get('nodeId'),
                    target: 'workflow',
                    state: "NEW",
                    type: "SYNC",
                    targetType: ENUMS.TargetType.MODULE.key,
                    active: true,
                    data: []
                };
                schemaModel.workflowCodes.forEach(workflowCode => {
                    removedModels.forEach(removedItem => {
                        event.data.push({
                            workflowCode: workflowCode,
                            itemType: 'INTERNAL',
                            item: {
                                code: removedItem.code,
                                active: false,
                                detail: {
                                    schemaName: schemaModel.schemaName,
                                    moduleName: schemaModel.moduleName,
                                }
                            }
                        });
                    });
                });
                this.LOG.debug('Pushing event for item initialize in workflow : ' + schemaModel.schemaName);
                SERVICE.DefaultEventService.publish(event).then(success => {
                    this.LOG.debug('Workflow associated successfully');
                }).catch(error => {
                    this.LOG.error('While associating workflow : ', error);
                });
            }
        } catch (error) {
            this.LOG.error('Facing issue while pushing workflow init event : ', error);
        }
        process.nextSuccess(request, response);
    }
};