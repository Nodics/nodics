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
    validateOperation: function (request, response, process) {
        let workflowItem = request.workflowItem;
        if (workflowItem.activeHead.code !== request.workflowHead.code) {
            process.error(request, response, 'Invalid request, workflow head mismatch, for item ' + workflowItem.code + ' with workflow head: ' + request.workflowHead.code);
        } else if (workflowItem.activeAction.code !== request.workflowAction.code) {
            process.error(request, response, 'Invalid request, workflow action mismatch, for item ' + workflowItem.code + ' with workflow head: ' + request.workflowAction.code);
        } else if ((workflowItem.activeAction.type === ENUMS.WorkflowActionType.MANUAL.key ||
            workflowItem.activeAction.type === ENUMS.WorkflowActionType.PARALLEL.key) &&
            (!request.actionResponse || UTILS.isBlank(request.actionResponse))) {
            process.error(request, response, 'Invalid request, action response can not be null or empty');
        } else {
            process.nextSuccess(request, response);
        }
    },
    prepareResponse: function (request, response, process) {
        this.LOG.debug('Preparing response for action execution');
        if (!response.success) response.success = {};
        if (!response.success[request.workflowAction.code]) response.success[request.workflowAction.code] = [];
        process.nextSuccess(request, response);
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
        if (request.workflowAction.type === ENUMS.WorkflowActionType.AUTO.key ||
            request.workflowAction.type === ENUMS.WorkflowActionType.PARALLEL.key) {
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
        if (response.actionResponse && !UTILS.isBlank(response.actionResponse)) {
            response.success[request.workflowAction.code].push({
                action: 'autoActionPerformed',
                target: request.workflowAction.code,
                item: request.workflowItem.code || request.workflowItem._id,
                timestamp: new Date(),
                msg: 'Auto action has been performed'
            });
        }
        request.actionResponse = _.merge(
            _.merge(response.actionResponse || {}, request.actionResponse || {}), {
            itemCode: request.workflowItem.code,
            originalCode: request.workflowItem.originalCode,
            workflowCode: request.workflowHead.code,
            actionCode: request.workflowAction.code
        });
        process.nextSuccess(request, response);
    },
    validateResponse: function (request, response, process) {
        this.LOG.debug('Validating action response');
        if (!request.actionResponse.decision) {
            process.error(request, response, 'Decision value can not be null or empty');
        } else if (request.workflowAction.allowedDecisions && !request.workflowAction.allowedDecisions.includes(request.actionResponse.decision)) {
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
            request.actionResponse = success.result[0];
            response.success[request.workflowAction.code].push({
                action: 'actionResponseCreated',
                target: request.workflowAction.code,
                item: request.workflowItem.code || request.workflowItem._id,
                timestamp: new Date(),
                msg: 'Action response updated: ' + request.actionResponse._id
            });
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
            response.success[request.workflowAction.code].push({
                action: 'itemUpdated',
                target: request.workflowAction.code,
                item: request.workflowItem.code || request.workflowItem._id,
                timestamp: new Date(),
                msg: 'Item has been updated with response id: ' + request.actionResponse._id
            });
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
        SERVICE.DefaultWorkflowChannelService.processChannels({
            tenant: request.tenant,
            workflowItem: request.workflowItem,
            workflowHead: request.workflowHead,
            workflowAction: request.workflowAction,
            actionResponse: request.actionResponse
        }).then(success => {
            try {
                if (success && success.result && !UTILS.isBlank(success.result)) {
                    Object.keys(success.result).forEach(actionCode => {
                        let actionOutput = success.result[actionCode];
                        actionOutput.forEach(output => {
                            response.success[actionCode].push(output);
                        });
                    });
                }
                process.nextSuccess(request, response);
            } catch (error) {
                process.error(request, response, error);
            }
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    successEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed successfully');
        process.resolve({
            success: true,
            code: 'SUC_SYS_00000',
            msg: SERVICE.DefaultStatusService.get('SUC_SYS_00000').message,
            result: response.success
        });
    },
    handleError: function (request, response, process) {
        this.LOG.error('Request has been processed and got errors');
        process.reject({
            success: false,
            code: 'ERR_SYS_00000',
            msg: SERVICE.DefaultStatusService.get('ERR_SYS_00000').message,
            errors: response.error || response.errors
        });
    }
};