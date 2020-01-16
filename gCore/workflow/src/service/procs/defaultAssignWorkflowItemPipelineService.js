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
        } else if (request.workflowHead && request.workflowCode) {
            process.error(request, response, 'Invalid request, workflow code or workflow head can not be null or empty');
        } else {
            process.nextSuccess(request, response);
        }
    },
    loadWorkflowItem: function (request, response, process) {
        if (request.workflowItem) {
            this.LOG.debug('Workflow item already available in request: ' + request.workflowItem.code);
            process.nextSuccess(request, response);
        } else if (request.workflowItemCode) {
            this.LOG.debug('Loading workflow item: ' + request.workflowItemCode);
            SERVICE.DefaultWorkflowItemService.get({
                tenant: request.tenant,
                query: {
                    code: request.workflowItemCode
                }
            }).then(response => {
                if (response.success && response.result.length > 0) {
                    request.workflowItem = response.result[0];
                    process.nextSuccess(request, response);
                } else {
                    process.error(request, response, 'Invalid request, none workflow action found for code: ' + request.workflowCode);
                }
            }).catch(error => {
                process.error(request, response, error);
            });
        } else if (request.itemType === ENUMS.WorkflowItemType.INTERNAL.key) {
            response.targetNode = 'loadInternalItem';
            process.nextSuccess(request, response);
        } else {
            response.targetNode = 'loadExternalItem';
            process.nextSuccess(request, response);
        }
    },
    loadWorkflowHead: function (request, response, process) {
        if (!request.workflowHead) {
            let workflowCode = request.workflowCode || request.workflowItem.workflowHead.code;
            this.LOG.debug('Loading workflow head: ' + workflowCode);
            SERVICE.DefaultWorkflowHeadService.get({
                tenant: request.tenant,
                query: {
                    code: workflowCode
                }
            }).then(response => {
                if (response.success && response.result.length > 0) {
                    request.workflowHead = response.result[0];
                    process.nextSuccess(request, response);
                } else {
                    process.error(request, response, 'Invalid request, none workflows found for code: ' + request.workflowCode);
                }
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    loadWorkflowAction: function (request, response, process) {
        this.LOG.debug('Loading workflow action: ' + request.workflowCode);
        if (!request.workflowAction && !request.actionCode) {
            request.workflowAction = request.workflowHead;
        } else if (!request.workflowAction && request.actionCode) {
            SERVICE.DefaultWorkflowActionService.get({
                tenant: request.tenant,
                query: {
                    code: request.actionCode
                }
            }).then(response => {
                if (response.success && response.result.length > 0) {
                    request.workflowAction = response.result[0];
                    process.nextSuccess(request, response);
                } else {
                    process.error(request, response, 'Invalid request, none workflow action found for code: ' + request.workflowCode);
                }
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    updateWorkflowItem: function (request, response, process) {
        request.workflowItem.lastActionCode = (request.workflowItem.activeAction) ? request.workflowItem.activeAction.code : '';
        if (!request.workflowItem.workflowHead) {
            request.workflowItem.workflowHead = {
                code: request.workflowHead.code
            };
        }
        request.workflowItem.activeAction = {
            code: request.workflowAction.code
        };
        if (!request.workflowItem.actions) request.workflowItem.actions = [];
        request.workflowItem.actions.push(request.workflowItem.activeAction.code);
        process.nextSuccess(request, response);
    },
    applyPutInterceptors: function (request, response, process) {
        let interceptors = SERVICE.DefaultWorkflowConfigurationService.getWorkflowInterceptors(request.workflowItem.activeAction.code);
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
        let validators = SERVICE.DefaultWorkflowConfigurationService.getWorkflowValidators(request.tenant, request.workflowItem.activeAction.code);
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
            SERVICE.DefaultPipelineService.start('performWorkflowActionPipeline', {
                tenant: request.tenant,
                workflowItem: request.workflowItem
            }, {}).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    successEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed successfully');
        response.success.msg = SERVICE.DefaultStatusService.get(response.success.code || 'SUC_SYS_00000').message;
        process.resolve(response.success);
    },
    handleError: function (request, response, process) {
        this.LOG.error('Request has been processed and got errors');
        response.error = (response.errors && response.errors.length === 1) ? response.errors[0] : response.error;
        if (!(response.error instanceof Error) || !UTILS.isObject(response.error)) {
            response.error = {
                message: response.error
            };
        }
        response.error.code = response.error.code || 'ERR_SYS_00000';
        SERVICE.DefaultPipelineService.start('handleWorkflowErrorsPipeline', request, response).then(success => {
            process.reject(response.error);
        }).catch(error => {
            process.reject(response.error);
        });
    }
};
