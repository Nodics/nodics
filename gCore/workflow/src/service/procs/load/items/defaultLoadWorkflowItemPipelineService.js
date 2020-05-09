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
        this.LOG.debug('Validating request to assign item with workflow');
        if (!request.tenant) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, tenant can not be null or empty'));
        } else if (!request.workflowItem && !request.item && !request.itemCode) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, item detail can not be null or empty'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    loadWorkflowItem: function (request, response, process) {
        if (!request.workflowItem && request.itemCode) {
            SERVICE.DefaultWorkflowItemService.get({
                tenant: request.tenant,
                loadActionResponse: false,
                query: {
                    code: request.itemCode
                }
            }).then(success => {
                if (success.result && success.result.length > 0) {
                    let workflowItem = success.result[0];
                    if (workflowItem.errorCount >= (CONFIG.get('workflow').itemErrorLimit || 5)) {
                        process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Item has crossed, error limit. Item: ' + workflowItem.code + ' requires manual intervation'));
                    } else if (!request.loadInActive && !workflowItem.active) {
                        process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00011', 'Item : ' + workflowItem.code + ' has been de-activated'));
                    } else {
                        request.workflowItem = workflowItem;
                        if (!request.workflowCode && !request.workflowHead) {
                            request.workflowCode = request.workflowItem.activeHead.code;
                        }
                        if (!request.workflowAction && !request.actionCode) {
                            request.actionCode = request.workflowItem.activeAction.code;
                        }
                        process.nextSuccess(request, response);
                    }
                } else {
                    process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, could not found workflow item for code: ' + request.itemCode));
                }
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    createNewItem: function (request, response, process) {
        this.LOG.debug('Creating new external workflow item');
        if (!request.workflowItem && request.item) {
            let item = request.item;
            request.workflowItem = _.merge({}, request.item);
            request.workflowItem.refId = item.refId || item.code;
            request.workflowItem.originalCode = item.originalCode || item.code;
            request.workflowItem.active = (item.active === undefined) ? true : item.active;
            request.workflowItem.event = request.workflowItem.event || {};
            request.workflowItem.event.enabled = request.workflowItem.event.enabled || false;
            request.workflowItem.callbackData = request.workflowItem.callbackData || {};
            process.nextSuccess(request, response);
        } else {
            process.nextSuccess(request, response);
        }
    },
    verifyWorkflowItem: function (request, response, process) {
        if (!request.workflowItem) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, none workflow item found with id: ' + request.itemCode));
        } else {
            process.nextSuccess(request, response);
        }
    }

};
