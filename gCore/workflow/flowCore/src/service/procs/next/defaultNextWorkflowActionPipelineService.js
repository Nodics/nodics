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
        this.LOG.debug('Validating request to assogn item to next action');
        if (!request.tenant) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, tenant can not be null or empty'));
        } else if (!request.actionCode) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, actionCode can not be null or empty'));
        } else if (!request.carrierCode && !request.workflowCarrier) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, carrier detail can not be null or empty'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    preUpdateCarrier: function (request, response, process) {
        let workflowCarrier = request.workflowCarrier;
        if (workflowCarrier.currentState.state != ENUMS.WorkflowCarrierState.PROCESSING.key) {
            let carrierState = {
                state: ENUMS.WorkflowCarrierState.PROCESSING.key,
                action: request.workflowAction.code,
                time: new Date(),
                description: 'Pushing carrier to processing state'
            };
            request.workflowCarrier.currentState = carrierState;
            request.workflowCarrier.states.push(carrierState);
        }
        workflowCarrier.activeAction = {
            code: request.workflowAction.code,
            state: ENUMS.WorkflowActionState.PROCESSING.key
        };
        if (request.workflowAction.position === ENUMS.WorkflowActionPosition.HEAD.key) {
            workflowCarrier.activeHead = request.workflowAction.code;
            workflowCarrier.heads.push(request.workflowAction.code);
        }
        process.nextSuccess(request, response);
    },
    updateCarrier: function (request, response, process) {
        SERVICE.DefaultWorkflowCarrierService.save({
            tenant: request.tenant,
            authData: request.authData,
            options: {
                recursive: true
            },
            model: request.workflowCarrier
        }).then(success => {
            response.success.workflowCarrier = request.workflowCarrier = success.result;
            response.success.messages.push('Action:' + request.workflowCarrier.activeAction.code + ' been assign to carrier @: ' + new Date());
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, new CLASSES.WorkflowError(error, 'Invalid request, workflowCode can not be null or empty'));
        });
    },
    executeNextAction: function (request, response, process) {
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
