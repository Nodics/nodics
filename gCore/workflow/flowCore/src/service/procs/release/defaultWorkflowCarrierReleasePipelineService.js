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
        this.LOG.debug('Validating request to release workflow carrier');
        if (!request.tenant) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, tenant can not be null or empty'));
        } else if (!request.carrierCode && !request.workflowCarrier) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, item detail can not be null or empty'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    releaseCarrier: function (request, response, process) {
        if (request.workflowCarrier.currentState.state === ENUMS.WorkflowCarrierState.INIT.key) {
            let carrierState = {
                state: ENUMS.WorkflowCarrierState.RELEASED.key,
                action: request.workflowAction.code,
                time: new Date(),
                description: request.comment || 'Carrier successfully released'
            };
            request.workflowCarrier.currentState = carrierState;
            request.workflowCarrier.states.push(carrierState);
            process.nextSuccess(request, response);
        } else {
            response.success.messages.push('WorkflowCarrier: ' + request.workflowCarrier.code + ' is already in released');
            process.stop(request, response);
        }
    },
    updateCarrier: function (request, response, process) {
        this.LOG.debug('Creating active workflow item');
        SERVICE.DefaultWorkflowCarrierService.save({
            tenant: request.tenant,
            moduleName: request.moduleName,
            options: {
                recursive: true
            },
            model: request.workflowCarrier
        }).then(success => {
            response.success.workflowCarrier = request.workflowCarrier = success.result;
            response.success.messages.push('WorkflowCarrier: ' + request.workflowCarrier.code + ' has been released successfully @: ' + new Date());
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    executeAction: function (request, response, process) {
        if (!SERVICE.DefaultWorkflowUtilsService.isProcessingAllowed(request.workflowCarrier)) {
            response.success.messages.push('Action: ' + request.workflowAction.code + ' processing not allowed @: ' + new Date());
        } else if (request.workflowAction.type != ENUMS.WorkflowActionType.AUTO.key) {
            response.success.messages.push('Action: ' + request.workflowAction.code + ' not a AUTO action @: ' + new Date());
        }
        if (SERVICE.DefaultWorkflowUtilsService.isProcessingAllowed(request.workflowCarrier) && request.workflowAction.type === ENUMS.WorkflowActionType.AUTO.key) {
            SERVICE.DefaultPipelineService.start('performWorkflowActionPipeline', {
                tenant: request.tenant,
                authData: request.authData,
                workflowHead: request.workflowHead,
                workflowAction: request.workflowAction,
                workflowCarrier: request.workflowCarrier,
            }, {}).then(success => {
                response.success.messages = response.success.messages.concat(success.messages || []);
                response.success.workflowCarrier = success.workflowCarrier || request.workflowCarrier
                delete success.messages;
                delete success.workflowCarrier;
                _.merge(response.success, success);
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    }
};
