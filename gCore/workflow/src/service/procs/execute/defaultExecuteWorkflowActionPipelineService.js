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

    /**
     * This pipeline process can be executed either via last executed action after assiging an item to action if it is AUTO, or via API if it is MANUAL. 
     * In case of AUTO workflowItem object will be mandate and for manual, itemCode and response will be mandate. Here response is what business
     * have thier comments for the action
     * @param {*} request 
     * @param {*} response 
     * @param {*} process 
     */
    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating request to perform workflow action');
        if (!request.tenant) {
            process.error(request, response, 'Invalid request, tenant can not be null or empty');
        } else {
            process.nextSuccess(request, response);
        }
    },
    loadWorkflowHead: function (request, response, process) {
        SERVICE.DefaultWorkflowHeadService.getWorkflowHead(request).then(workflowHead => {
            request.workflowHead = workflowHead;
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    loadWorkflowAction: function (request, response, process) {
        SERVICE.DefaultWorkflowActionService.getWorkflowAction(request).then(workflowAction => {
            request.workflowAction = workflowAction;
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    validateOperation: function (request, response, process) {
        let workflowItem = request.workflowItem;
        if (workflowItem.workflowHead.code !== request.workflowHead.code) {
            process.error(request, response, 'Invalid request, workflow head mismatch, for item ' + workflowItem.code + ' with workflow head: ' + request.workflowHead.code);
        } else if (workflowItem.activeAction.code !== request.workflowAction.code) {
            process.error(request, response, 'Invalid request, workflow action mismatch, for item ' + workflowItem.code + ' with workflow head: ' + request.workflowAction.code);
        } else if (workflowItem.activeAction.type === ENUMS.WorkflowActionType.MANUAL.key && !request.actionResponse) {
            process.error(request, response, 'Invalid request, action response can not be null or empty');
        } else {
            process.nextSuccess(request, response);
        }
    },
    preActionInterceptors: function (request, response, process) {
        let interceptors = SERVICE.DefaultWorkflowConfigurationService.getWorkflowInterceptors(request.workflowAction.code);
        if (interceptors && interceptors.preAction) {
            this.LOG.debug('Applying preAction interceptors for workflow action execution');
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.preAction), request, response).then(success => {
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
    preActionValidators: function (request, response, process) {
        let validators = SERVICE.DefaultWorkflowConfigurationService.getWorkflowValidators(request.tenant, request.workflowAction.code);
        if (validators && validators.preAction) {
            this.LOG.debug('Applying preAction validators for workflow action execution');
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.preAction), request, response).then(success => {
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
    handleAutoAction: function (request, response, process) {
        if (request.workflowAction.type === ENUMS.WorkflowActionType.AUTO.key) {
            if (request.workflowAction.handler) {
                response.targetNode = 'executeActionHandler';
                process.nextSuccess(request, response);
            } else if (request.workflowAction.script) {
                response.targetNode = 'executeActionScript';
                process.nextSuccess(request, response);
            } else {
                process.error(request, response, 'Invalid action, AUTO action should have handler or script');
            }
        } else {
            process.nextSuccess(request, response);
        }
    },
    createStepResponse: function (request, response, process) {
        request.actionResponse = _.merge(response.success || request.actionResponse, {
            itemCode: request.workflowItem.code,
            originalCode: request.workflowItem.originalCode,
            workflowCode: request.workflowHead.code,
            actionCode: request.workflowAction.code
        });
        if (request.workflowAction.allowedDecisions && !request.workflowAction.allowedDecisions.includes(request.actionResponse.decision)) {
            process.error(request, response, 'Invalid decision value, action don not allow value: ' + request.actionResponse.decision);
        } else {
            process.nextSuccess(request, response);
        }
    },
    updateActionResponse: function (request, response, process) {
        SERVICE.DefaultActionResponseService.save({
            tenant: request.tenant,
            models: [request.actionResponse]
        }).then(success => {
            if (success.result && success.result.length > 0) {
                request.actionResponse = success.result[0];
            }
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    updateWorkflowItem: function (request, response, process) {
        request.workflowItem.activeAction.responseId = request.actionResponse._id;
        SERVICE.DefaultWorkflowItemService.save({
            tenant: request.tenant,
            models: [request.workflowItem]
        }).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    postActionInterceptors: function (request, response, process) {
        let interceptors = SERVICE.DefaultWorkflowConfigurationService.getWorkflowInterceptors(request.workflowAction.code);
        if (interceptors && interceptors.postAction) {
            this.LOG.debug('Applying postAction interceptors for workflow action execution');
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.postAction), request, response).then(success => {
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
    postActionValidators: function (request, response, process) {
        let validators = SERVICE.DefaultWorkflowConfigurationService.getWorkflowValidators(request.tenant, request.workflowAction.code);
        if (validators && validators.postAction) {
            this.LOG.debug('Applying postAction validators for workflow action execution');
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.postAction), request, response).then(success => {
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
    triggerActionPerformedEvent: function (request, response, process) {
        this.LOG.debug('Publishing success event');
        process.nextSuccess(request, response);

    },
    processChannels: function (request, response, process) {
        this.LOG.debug('Starting channel execution process');
        if (request.qualifiedChannels.length > 0) {
            return new Promise((resolve, reject) => {
                SERVICE.DefaultPipelineService.start('evaluateChannelsPipeline', {
                    tenant: request.tenant,
                    workflowItem: request.workflowItem,
                    workflowHead: request.workflowHead,
                    workflowAction: request.workflowAction,
                    actionResponse: request.actionResponse
                }, {}).then(success => {
                    process.nextSuccess(request, response);
                }).catch(error => {
                    process.error(request, response, error);
                });
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
        SERVICE.DefaultWorkflowChannelService.handleErrorProcess(request, response).then(success => {
            process.reject(response.error);
        }).catch(error => {
            process.reject(response.error);
        });
    }
};
