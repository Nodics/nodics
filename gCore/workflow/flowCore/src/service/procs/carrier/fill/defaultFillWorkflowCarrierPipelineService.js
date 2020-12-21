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
        this.LOG.debug('Validating request to add item into carrier');
        if (!request.tenant) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, tenant can not be null or empty'));
        } else if (!request.carrierCode && !request.workflowCarrier) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, item detail can not be null or empty'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    checkValidRequest: function (request, response, process) {
        if (request.addedNewItems && request.workflowCarrier.type === ENUMS.WorkflowCarrierType.FIXED.key && request.workflowCarrier.currentState.state != ENUMS.WorkflowCarrierState.INIT.key) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, items can not be added in FIXED carrier, after its released'));
        } else if (request.addedNewItems && !request.workflowAction.isNewItemsAllowed) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, items can not be added, action not allow this operation'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    preFillInterceptors: function (request, response, process) {
        let interceptors = SERVICE.DefaultWorkflowConfigurationService.getWorkflowInterceptors(request.workflowHead.code);
        if (interceptors && interceptors.preFill) {
            this.LOG.debug('Applying preFill interceptors for workflow carrier');
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.preFill), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.WorkflowError(error, 'Failed action interceptors', 'ERR_WF_00005'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    preFillValidators: function (request, response, process) {
        let validators = SERVICE.DefaultWorkflowConfigurationService.getWorkflowValidators(request.tenant, request.workflowHead.code);
        if (validators && validators.preFill) {
            this.LOG.debug('Applying preFill validators for workflow carrier');
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.preFill), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.WorkflowError(error, 'Failed action validators', 'ERR_WF_00005'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    updateCarrier: function (request, response, process) {
        this.LOG.debug('Updating carrier with new items');
        SERVICE.DefaultWorkflowCarrierService.save({
            tenant: request.tenant,
            moduleName: request.moduleName,
            options: {
                recursive: true
            },
            model: request.workflowCarrier
        }).then(success => {
            request.workflowCarrier = success.result;
            response.success = 'WorkflowCarrier: ' + request.workflowCarrier.code + ' has been filled successfully';
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    postFillValidators: function (request, response, process) {
        let validators = SERVICE.DefaultWorkflowConfigurationService.getWorkflowValidators(request.tenant, request.workflowHead.code);
        if (validators && validators.postFill) {
            this.LOG.debug('Applying postFill validators for workflow carrier');
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.postFill), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.WorkflowError(error, 'Failed block validators', 'ERR_WF_00006'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    postFillInterceptors: function (request, response, process) {
        let interceptors = SERVICE.DefaultWorkflowConfigurationService.getWorkflowInterceptors(request.workflowHead.code);
        if (interceptors && interceptors.postFill) {
            this.LOG.debug('Applying postFill interceptors for workflow carrier');
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.postFill), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.WorkflowError(error, 'Failed block interceptors', 'ERR_WF_00006'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    triggerFilledEvent: function (request, response, process) {
        let eventConfig = SERVICE.DefaultWorkflowUtilsService.getEventConfiguration(request.workflowAction, request.workflowCarrier);
        if (eventConfig.enabled) {
            try {
                this.LOG.debug('Pushing event for carrier filled : ' + request.workflowCarrier.code);
                let newCodes = request.items.map(item => {
                    return item.code;
                });
                let data = {
                    newItems: [],
                    oldItems: []
                };
                request.workflowCarrier.items.forEach(item => {
                    if (newCodes.includes(item.code)) {
                        data.newItems.push({
                            code: item.code,
                            refId: item.refId,
                            originalCode: item.originalCode
                        });
                    } else {
                        data.oldItems.push({
                            code: item.code,
                            refId: item.refId,
                            originalCode: item.originalCode
                        });
                    }
                });
                SERVICE.DefaultWorkflowEventService.publishEvent({
                    tenant: request.tenant,
                    event: 'carrierFilled',
                    type: eventConfig.type || CONFIG.get('workflow').defaultEventType,
                    data: data
                }, request.workflowAction, request.workflowCarrier).then(success => {
                    this.LOG.debug('Event successfully posted');
                }).catch(error => {
                    this.LOG.error('While posting carrier filled event : ', error);
                });
            } catch (error) {
                this.LOG.error('Facing issue posting carrier filled event : ', error);
            }
        }
        process.nextSuccess(request, response);
    },
    handleSuccess: function (request, response, process) {
        let result = response.success;
        if (response.success.result) {
            result = response.success.result;
        }
        process.resolve({
            code: 'SUC_WF_00000',
            result: result
        });
    }
};
