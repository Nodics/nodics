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
        this.LOG.debug('Validating request for default error handler');
        if (!request.tenant) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, Tenant can not be null or empty'));
        } else if (!request.workflowCarrier || !request.workflowCarrier._id) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, Workflow carrier can not be null or empty'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    updateError: function (request, response, process) {
        request.workflowCarrier.activeAction.state = ENUMS.WorkflowCarrierState.ERROR.key;
        if (!request.workflowCarrier.errors) request.workflowCarrier.errors = [];
        request.workflowCarrier.errors.push(response.error.toJson());
        request.workflowCarrier.errorCount = request.workflowCarrier.errorCount + 1;
        if (!request.workflowCarrier.states) request.workflowCarrier.states = [];
        let carrierState = {
            state: ENUMS.WorkflowCarrierState.ERROR.key,
            action: request.workflowAction.code,
            time: new Date(),
            description: 'Error occurred, please last item in errors list'
        };
        request.workflowCarrier.currentState = carrierState;
        request.workflowCarrier.states.push(carrierState);
        process.nextSuccess(request, response);
    },
    createErrorItem: function (request, response, process) {
        this.LOG.debug('Creating error item');
        if (request.workflowCarrier.errorCount >= (CONFIG.get('workflow').itemErrorLimit || 5)) {
            response.errorItem = _.merge({}, request.workflowCarrier);
            delete response.errorItem._id;
            if (response.errorItem.states && response.errorItem.states.length > 0) {
                let items = [];
                response.errorItem.states.forEach(wtItem => {
                    delete wtItem._id;
                    items.push(wtItem);
                });
                response.errorItem.states = items;
            }
        }
        process.nextSuccess(request, response);
    },
    errorInterceptors: function (request, response, process) {
        let interceptors = SERVICE.DefaultWorkflowConfigurationService.getWorkflowInterceptors(request.workflowHead.code);
        if (interceptors && interceptors.error) {
            this.LOG.debug('Applying  interceptors for workflow carrier error');
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.error), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.WorkflowError(error, 'Failed carrier error interceptors', 'ERR_WF_00005'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    errorValidators: function (request, response, process) {
        let validators = SERVICE.DefaultWorkflowConfigurationService.getWorkflowValidators(request.tenant, request.workflowHead.code);
        if (validators && validators.error) {
            this.LOG.debug('Applying prePause validators for workflow carrier error');
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.error), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.WorkflowError(error, 'Failed carrier error validators', 'ERR_WF_00005'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    updateErrorPool: function (request, response, process) {
        this.LOG.debug('updating error pool');
        if (request.workflowCarrier.errorCount >= (CONFIG.get('workflow').itemErrorLimit || 5)) {
            SERVICE.DefaultWorkflowErrorCarrierService.save({
                tenant: request.tenant,
                model: response.errorItem
            }).then(success => {
                this.LOG.info('carrier: has been moved to error pool successfully');
                if (!response.success.messages) response.success.messages = [];
                response.success.messages.push('carrier: has been moved to error pool successfully: ' + request.workflowCarrier.code);
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    updateItemPool: function (request, response, process) {
        this.LOG.debug('updating item pool');
        if (request.workflowCarrier.errorCount >= (CONFIG.get('workflow').itemErrorLimit || 5)) {
            SERVICE.DefaultWorkflowCarrierService.removeById([request.workflowCarrier._id], request.tenant).then(success => {
                this.LOG.info('carrier: has been removed from item pool successfully');
                if (!response.success) response.success.messages = [];
                response.success.messages.push('carrier: has been removed from item pool successfully: ' + request.workflowCarrier.code);
                process.error(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            SERVICE.DefaultWorkflowCarrierService.save({
                tenant: request.tenant,
                options: {
                    recursive: true
                },
                model: request.workflowCarrier
            }).then(success => {
                this.LOG.debug('Error been updated for carrier: ' + request.workflowCarrier.code);
            }).catch(error => {
                this.LOG.debug('Failed updating error for carrier: ' + request.workflowCarrier.code);
            });
            if (!response.success) response.success = [];
            if (!response.success.messages) response.success.messages = [];
            if (response.error) {
                response.error.add(new CLASSES.WorkflowError('Error has been updated into workflow carrier'));
            } else {
                response.error = new CLASSES.WorkflowError('Error has been updated into workflow carrier');
            }
        }
        process.nextSuccess(request, response);
    },
    triggerErrorOccuredEvent: function (request, response, process) {
        response.success.messages.push('Event errorOccured triggered for action: ' + request.workflowAction.code);
        let eventConfig = SERVICE.DefaultWorkflowUtilsService.getEventConfiguration(request.workflowAction, request.workflowCarrier);
        if (eventConfig.enabled) {
            try {
                this.LOG.debug('Pushing event for error occured : ' + request.workflowCarrier.code);
                SERVICE.DefaultWorkflowEventService.publishEvent({
                    tenant: request.tenant,
                    event: 'errorOccurred',
                    type: eventConfig.type || CONFIG.get('workflow').defaultEventType,
                    data: {
                        error: response.error.toJson()
                    }
                }, request.workflowAction, request.workflowCarrier).then(success => {
                    this.LOG.debug('Event successfully posted');
                }).catch(error => {
                    this.LOG.error('While posting error occured event : ', error);
                });
            } catch (error) {
                this.LOG.error('Facing issue posting error occured event : ', error);
            }
        }
        process.error(request, response);
    }
};
