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
        this.LOG.debug('Validating request to init item with workflow');
        if (!request.tenant || !request.authData) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, tenant or auth data can not be null or empty'));
        } else if (!request.workflowCode) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, workflowCode can not be null or empty'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    prepareResponse: function (request, response, process) {
        this.LOG.debug('Preparing response for action execution');
        if (!response.success) {
            response.success = {
                messages: []
            };
        }
        process.nextSuccess(request, response);
    },
    buildWorkflowCarrier: function (request, response, process) {
        request.workflowCarrier = SERVICE.DefaultWorkflowCarrierService.buildWorkflowCarrier({
            tenant: request.tenant,
            authData: request.authData,
            workflowCode: request.workflowCode,
            carrier: request.carrier || {}
        });
        response.success.messages.push('Carrier: ' + (request.workflowCarrier.code || request.workflowCarrier._id) + ' created for workflow: ' + request.workflowCode + ' @: ' + new Date());
        process.nextSuccess(request, response);
    },
    validateWorkflowCarrier: function (request, response, process) {
        this.LOG.debug('Validating workflow carrier if available');
        SERVICE.DefaultWorkflowCarrierService.isCarrierAvailable({
            tenant: request.tenant,
            authData: request.authData,
            carrierCode: request.workflowCarrier.code
        }).then(success => {
            response.success.messages.push('Carrier: ' + (request.workflowCarrier.code || request.workflowCarrier._id) + ' validated if exist:' + success + ' @: ' + new Date());
            if (success) {
                process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, carrier with code: ' + request.workflowCarrier.code + ' already exist'));
            } else {
                process.nextSuccess(request, response);
            }
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    loadWorkflowHead: function (request, response, process) {
        SERVICE.DefaultWorkflowActionService.getWorkflowHead(request.workflowCode, request.tenant).then(workflowHead => {
            request.workflowHead = request.workflowAction = workflowHead;
            response.success.messages.push('Workflow head: ' + request.workflowHead.code + ' retrived @: ' + new Date());
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    updateCarrier: function (request, response, process) {
        this.LOG.debug('Updating workflow item');
        let workflowCarrier = request.workflowCarrier;
        workflowCarrier.activeAction = {
            code: request.workflowAction.code
        };
        if (request.workflowAction.position === ENUMS.WorkflowActionPosition.HEAD.key) {
            workflowCarrier.activeHead = request.workflowAction.code;
            if (!workflowCarrier.heads) workflowCarrier.heads = [];
            workflowCarrier.heads.push(request.workflowAction.code);
        }
        process.nextSuccess(request, response);
    },
    saveActiveItem: function (request, response, process) {
        this.LOG.debug('Creating active workflow item');
        SERVICE.DefaultWorkflowCarrierService.save({
            tenant: request.tenant,
            authData: request.authData,
            options: {
                recursive: true
            },
            model: request.workflowCarrier
        }).then(success => {
            response.success.workflowCarrier = request.workflowCarrier = success.result;
            response.success.messages.push('Carrier: ' + (request.workflowCarrier.code || request.workflowCarrier._id) + ' assign to workflow: ' + request.workflowAction.code + ' @: ' + new Date());
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, new CLASSES.WorkflowError(error, 'Invalid request, workflowCode can not be null or empty'));
        });
    },
    releaseWorkflow: function (request, response, process) {
        this.LOG.debug('Preparing carrier status for carrier assignmnet');
        if (request.releaseCarrier && request.workflowCarrier.currentState.state != ENUMS.WorkflowCarrierState.RELEASED.key) {
            SERVICE.DefaultPipelineService.start('releaseWorkflowCarrierPipeline', {
                tenant: request.tenant,
                authData: request.authData,
                workflowHead: request.workflowHead,
                workflowAction: request.workflowAction,
                workflowCarrier: request.workflowCarrier,
            }, {}).then(success => {
                response.success.messages = response.success.messages.concat(success.messages || []);
                response.success.workflowCarrier = success.workflowCarrier || response.success.workflowCarrier
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
