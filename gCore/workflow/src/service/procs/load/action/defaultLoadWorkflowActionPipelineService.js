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
        this.LOG.debug('Validating request to load workflow action');
        if (!request.tenant) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, tenant can not be null or empty'));
        } else if (!request.workflowCode && !request.workflowAction && !request.actionCode) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, actionCode can not be null or empty'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    loadWorkflowAction: function (request, response, process) {
        if (!request.workflowAction) {
            request.actionCode = request.actionCode || ((request.workflowItem.activeAction) ? request.workflowItem.activeAction.code : undefined) || request.workflowCode;
            if (request.actionCode) {
                SERVICE.DefaultWorkflowActionService.getWorkflowAction(request.actionCode, request.tenant).then(workflowAction => {
                    request.workflowAction = workflowAction;
                    if (request.workflowAction) request.workflowAction.isHead = false;
                    process.nextSuccess(request, response);
                }).catch(error => {
                    if (error.code && error.code === 'ERR_WF_00010') {
                        process.nextSuccess(request, response);
                    } else {
                        process.error(request, response, error);
                    }
                });
            } else {
                process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, could not load workflow action'));
            }
        } else {
            process.nextSuccess(request, response);
        }
    },
    handleSubWorkflowAction: function (request, response, process) {
        if (!request.workflowAction && request.actionCode) {
            SERVICE.DefaultWorkflowHeadService.getWorkflowHeadByCode(request.actionCode, request.tenant).then(workflowAction => {
                request.workflowAction = workflowAction;
                if (request.workflowAction) request.workflowAction.isHead = true;
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    validateAction: function (request, response, process) {
        if (!request.workflowAction) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Cound not load workflow action, please validate your request'));
        } else {
            process.nextSuccess(request, response);
        }
    }
};
