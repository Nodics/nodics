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
        } else if (!request.workflowHead && !request.workflowCode) {
            process.error(request, response, 'Invalid request, workflow code or workflow head can not be null or empty');
        } else if (!request.workflowAction && !request.actionCode) {
            process.error(request, response, 'Invalid request, workflow action code or workflow action can not be null or empty');
        } else if (!request.workflowItems && !request.items && !request.itemCodes && !request.itemCode) {
            process.error(request, response, 'Invalid request, cound not found any items to perform this process');
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
        let errors = [];
        Object.keys(request.workflowItems).forEach(itemCode => {
            let workflowItem = request.workflowItems[itemCode].item;
            if (workflowItem.workflowHead.code !== request.workflowHead.code) {
                errors.push('Invalid request, workflow head mismatch, for item ' + workflowItem.code + ' with workflow head: ' + request.workflowHead.code);
            } else if (workflowItem.activeAction.code !== request.workflowAction.code) {
                errors.push('Invalid request, workflow action mismatch, for item ' + workflowItem.code + ' with workflow head: ' + request.workflowAction.code);
            }
        });
        if (errors.length > 0) {
            process.error(request, response, errors);
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
        let actionResponses = response.success || request.actionResponse;
        if (!response.errors) response.errors = [];
        Object.keys(request.workflowItems).forEach(itemCode => {
            let workflowItem = request.workflowItems[itemCode];
            let itemResponse = actionResponses[itemCode] || actionResponses.default;
            if (!request.workflowAction.allowedDecisions || request.workflowAction.allowedDecisions.includes(itemResponse.decision)) {
                workflowItem.itemResponse = {
                    itemCode: workflowItem.item.code,
                    originalCode: workflowItem.item.originalCode,
                    workflowCode: request.workflowHead.code,
                    actionCode: request.workflowAction.code,
                    decision: itemResponse.decision,
                    response: itemResponse.feedback,
                    channels: []
                };
            } else {
                response.errors.push('Invalid decision: ' + decision + ' for action: ' + request.workflowAction.code);
            }
        });
        process.nextSuccess(request, response);
    },
    evaluateChannels: function (request, response, process) {
        this.LOG.debug('Starting channel evaluation process');
        let itemsResponses = [];
        Object.keys(request.workflowItems).forEach(itemCode => {
            let workflowItem = request.workflowItems[itemCode];
            itemsResponses.push(workflowItem.itemResponse);
        });
        SERVICE.DefaultWorkflowChannelService.getQalifiedChannel(itemsResponses, request.workflowAction).then(qualifiedChannels => {
            Object.keys(request.workflowItems).forEach(itemCode => {
                let workflowItem = request.workflowItems[itemCode];
                if (qualifiedChannels[itemCode] && qualifiedChannels[itemCode].length > 0) {
                    workflowItem.channels = qualifiedChannels[itemCode];
                    workflowItem.channels.forEach(channel => {
                        workflowItem.itemResponse.channels.push(channel.code);
                    })
                } else {
                    response.errors.push('Could not found any qualified channel for item: ' + itemCode + ' for action: ' + request.workflowAction.code);
                }
            });
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    updateStepResponse: function (request, response, process) {
        let itemsResponses = [];
        Object.keys(request.workflowItems).forEach(itemCode => {
            let workflowItem = request.workflowItems[itemCode];
            itemsResponses.push(workflowItem.itemResponse);
        });
        SERVICE.DefaultActionResponseService.save({
            tenant: request.tenant,
            models: itemsResponses
        }).then(success => {
            if (success.result && success.result.length > 0) {
                success.result.forEach(itemModel => {
                    let workflowItem = request.workflowItems[itemModel.code];
                    if (workflowItem) {
                        workflowItem.itemResponse = itemModel;
                    }
                });
            }
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
    executeChannel: function (request, response, process) {
        this.LOG.debug('Starting channel execution process');
        if (request.qualifiedChannels.length > 0) {
            SERVICE.DefaultPipelineService.start('executeChannelsPipeline', {
                tenant: request.tenant,
                workflowHead: request.workflowHead,
                workflowAction: request.workflowAction,
                workflowItems: request.workflowItems
            }, {}).then(success => {
                resolve(success);
            }).catch(error => {
                reject(error);
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
