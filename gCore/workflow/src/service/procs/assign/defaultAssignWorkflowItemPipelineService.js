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
            process.error(request, response, 'Invalid request, tenant can not be null or empty');
        } else {
            process.nextSuccess(request, response);
        }
    },
    updateWorkflowItem: function (request, response, process) {
        this.LOG.debug('Updating workflow item');
        let workflowItem = request.workflowItem;
        if (request.workflowAction.isHead) {
            if (workflowItem.activeHead && workflowItem.activeHead.code) {
                if (!workflowItem.heads) workflowItem.heads = [];
                workflowItem.heads.push(workflowItem.activeHead.code);
            }
            workflowItem.activeHead = {
                code: request.workflowAction.code
            };
        } else {
            if (!workflowItem.actions) workflowItem.actions = [];
            workflowItem.actions.push(request.workflowAction.code);
        }
        if (workflowItem.activeAction) workflowItem.lastAction = workflowItem.activeAction.code;
        workflowItem.activeAction = {
            code: request.workflowAction.code
        };
        process.nextSuccess(request, response);
    },
    applyPutInterceptors: function (request, response, process) {
        let interceptors = SERVICE.DefaultWorkflowConfigurationService.getWorkflowInterceptors(request.workflowAction.code);
        if (interceptors && interceptors.put) {
            this.LOG.debug('Applying put interceptors for workflow item creation');
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.put), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, {
                    success: false,
                    code: 'ERR_SYS_00000',
                    error: error.toString()
                });
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    applyPutValidators: function (request, response, process) {
        let validators = SERVICE.DefaultWorkflowConfigurationService.getWorkflowValidators(request.tenant, request.workflowAction.code);
        if (validators && validators.put) {
            this.LOG.debug('Applying put validators for workflow item creation');
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.put), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, {
                    success: false,
                    code: 'ERR_SYS_00000',
                    error: error.toString()
                });
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    saveActiveItem: function (request, response, process) {
        this.LOG.debug('Creating active workflow item');
        SERVICE.DefaultWorkflowItemService.save({
            tenant: request.tenant,
            moduleName: request.moduleName,
            models: [request.workflowItem]
        }).then(success => {
            console.log('=========>>> ', success.result);
            request.workflowItem = success.result[0];
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    performAction: function (request, response, process) {
        this.LOG.debug('Triggering action for auto workflow head');
        if (request.workflowAction.type === ENUMS.WorkflowActionType.AUTO.key) {
            SERVICE.DefaultWorkflowService.performAction({
                tenant: request.tenant,
                workflowHead: request.workflowHead,
                workflowAction: request.workflowAction,
                workflowItem: request.workflowItem
            }).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    }
};
