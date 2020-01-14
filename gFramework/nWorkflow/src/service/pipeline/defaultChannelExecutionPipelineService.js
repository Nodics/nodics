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
     * In case of AUTO workflowItem object will be mandate and for manual, workflowItemCode and response will be mandate. Here response is what business
     * have thier comments for the action
     * @param {*} request 
     * @param {*} response 
     * @param {*} process 
     */
    validateRequest: function (request, response, process) {
        if (!request.tenant) {
            process.error(request, response, 'Invalid request, tenant can not be null or empty');
        } else if (!request.actionResponse) {
            process.error(request, response, 'Invalid request, could not found a valid action response');
        } else if (!request.channel) {
            process.error(request, response, 'Invalid request, could not found a valid channel');
        } else if (!request.workflowAction && !request.workflowActionCode) {
            process.error(request, response, 'Invalid request, could not found a valid workflow action');
        } else {
            process.nextSuccess(request, response);
        }
    },
    loadWorkflowItem: function (request, response, process) {
        this.LOG.debug('Create Workflow Active Item');
        if (!request.workflowItem) {
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
        } else {
            process.nextSuccess(request, response);
        }
    },
    loadWorkflowHead: function (request, response, process) {
        this.LOG.debug('Loading workflow head: ' + request.workflowCode);
        if (!request.workflowHead) {
            let workflowHead = request.workflowItem.workflowHead;
            SERVICE.DefaultWorkflowHeadService.get({
                tenant: request.tenant,
                query: {
                    code: workflowHead.code
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
        if (!request.workflowAction) {
            let workflowAction = request.workflowItem.workflowAction;
            SERVICE.DefaultWorkflowActionService.get({
                tenant: request.tenant,
                query: {
                    code: workflowAction.code
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
    preChannelInterceptors: function (request, response, process) {
        let interceptors = SERVICE.DefaultWorkflowConfigurationService.getWorkflowInterceptors(request.channel.code);
        if (interceptors && interceptors.preChannel) {
            this.LOG.debug('Applying preChannel interceptors for workflow channel execution');
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.preChannel), request, response).then(success => {
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
    preChannelValidators: function (request, response, process) {
        let validators = SERVICE.DefaultWorkflowConfigurationService.getWorkflowValidators(request.tenant, request.channel.code);
        if (validators && validators.preChannel) {
            this.LOG.debug('Applying preChannel validators for workflow channel execution');
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.preChannel), request, response).then(success => {
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
    triggerTarget: function (request, response, process) {
        SERVICE.DefaultWorkflowService.assignItem({
            workflowHead: request.workflowHead,
            workflowItem: request.workflowItem,
            workflowActionCode: request.channel.target
        }).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    postChannelInterceptors: function (request, response, process) {
        let interceptors = SERVICE.DefaultWorkflowConfigurationService.getWorkflowInterceptors(request.channel.code);
        if (interceptors && interceptors.postChannel) {
            this.LOG.debug('Applying postChannel interceptors for workflow channel execution');
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.postChannel), request, response).then(success => {
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
    postChannelValidators: function (request, response, process) {
        let validators = SERVICE.DefaultWorkflowConfigurationService.getWorkflowValidators(request.tenant, request.channel.code);
        if (validators && validators.postChannel) {
            this.LOG.debug('Applying postChannel validators for workflow channel execution');
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.postChannel), request, response).then(success => {
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
    successEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed successfully');
        response.success.msg = SERVICE.DefaultStatusService.get(response.success.code || 'SUC_SYS_00000').message;
        process.resolve(response.success);
    },
    handleError: function (request, response, process) {
        this.LOG.error('Request has been processed and got errors');
        if (response.errors && response.errors.length === 1) {
            process.reject(response.errors[0]);
        } else if (response.errors && response.errors.length > 1) {
            process.reject({
                success: false,
                code: 'ERR_SYS_00000',
                error: response.errors
            });
        } else {
            process.reject(response.error);
        }
    }
};
