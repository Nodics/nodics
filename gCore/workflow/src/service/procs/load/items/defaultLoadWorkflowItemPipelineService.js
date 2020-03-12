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
        this.LOG.debug('Validating request to assign item with workflow');
        if (!request.tenant) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, tenant can not be null or empty'));
        } else if (!request.workflowItem && !request.item && !request.itemCode) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, item detail can not be null or empty'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    loadItem: function (request, response, process) {
        if (!request.workflowItem && request.itemCode) {
            SERVICE.DefaultWorkflowItemService.get({
                tenant: request.tenant,
                query: {
                    code: request.itemCode
                }
            }).then(success => {
                if (success.result && success.result.length > 0) {
                    request.workflowItem = success.result[0];
                    if (!request.workflowCode && !request.workflowHead) {
                        request.workflowCode = request.workflowItem.activeHead.code;
                    }
                    if (!request.workflowAction && !request.actionCode) {
                        request.actionCode = request.workflowItem.activeAction.code;
                    }
                    process.nextSuccess(request, response);
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
    redirectCreateItem: function (request, response, process) {
        if (!request.workflowItem && request.item) {
            request.actionCode = request.actionCode || request.workflowHead;
            if (request.itemType === ENUMS.WorkflowItemType.INTERNAL.key) {
                response.targetNode = 'loadInternalItem';
                process.nextSuccess(request, response);
            } else {
                response.targetNode = 'loadExternalItem';
                process.nextSuccess(request, response);
            }
        } else {
            process.nextSuccess(request, response);
        }
    }
};
