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
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, tenant can not be null or empty'));
        } else if (!request.channel) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, could not found a valid channel'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    prepareResponse: function (request, response, process) {
        this.LOG.debug('Preparing response for action execution');
        process.nextSuccess(request, response);
    },
    loadActionResponse: function (request, response, process) {
        SERVICE.DefaultWorkflowActionResponseService.getActionResponse(request).then(actionResponse => {
            request.actionResponse = actionResponse;
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    handleMultiChannelRequest: function (request, response, process) {
        if (request.splitItem) {
            let workflowItem = _.merge({}, request.workflowItem);
            delete workflowItem._id;
            workflowItem.code = workflowItem.code + '_' + request.channel.count;
            workflowItem.originalCode = channelRequest.originalCode;
            SERVICE.DefaultWorkflowItemService.save({
                tenant: request.tenant,
                model: workflowItem
            }).then(success => {
                request.workflowItem = success.result;
                process.nextSuccess(request, response);
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
                process.error(request, response, new CLASSES.WorkflowError(error, 'Failed channel interceptors', 'ERR_WF_00005'));
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
                process.error(request, response, new CLASSES.WorkflowError(error, 'Failed channel validators', 'ERR_WF_00005'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    triggerTarget: function (request, response, process) {
        SERVICE.DefaultWorkflowService.nextAction({
            tenant: request.tenant,
            workflowItem: request.workflowItem,
            actionCode: request.channel.target
        }).then(success => {
            response.success = success;
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    postChannelValidators: function (request, response, process) {
        let validators = SERVICE.DefaultWorkflowConfigurationService.getWorkflowValidators(request.tenant, request.channel.code);
        if (validators && validators.postChannel) {
            this.LOG.debug('Applying postChannel validators for workflow channel execution');
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.postChannel), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.WorkflowError(error, 'Failed channel validators', 'ERR_WF_00006'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    postChannelInterceptors: function (request, response, process) {
        let interceptors = SERVICE.DefaultWorkflowConfigurationService.getWorkflowInterceptors(request.channel.code);
        if (interceptors && interceptors.postChannel) {
            this.LOG.debug('Applying postChannel interceptors for workflow channel execution');
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.postChannel), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.WorkflowError(error, 'Failed channel interceptors', 'ERR_WF_00006'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    }
};
