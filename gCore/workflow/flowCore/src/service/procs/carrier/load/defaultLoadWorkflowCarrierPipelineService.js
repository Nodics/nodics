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
        this.LOG.debug('Validating request to load workflow carrier');
        if (!request.tenant) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, tenant can not be null or empty'));
        } else if (!request.workflowCarrier && !request.carrierCode && (!request.carrier || !request.carrier.code)) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, carrir detail can not be null or empty'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    loadWorkflowCarrier: function (request, response, process) {
        if (!request.workflowCarrier && (request.carrierCode || request.carrier.code)) {
            let carrierCode = request.carrierCode || request.carrier.code;
            SERVICE.DefaultWorkflowCarrierService.get({
                tenant: request.tenant,
                options: {
                    loadActionResponse: false
                },
                query: {
                    code: carrierCode
                }
            }).then(success => {
                if (success.result && success.result.length > 0) {
                    let workflowCarrier = success.result[0];
                    if (workflowCarrier.errorCount >= (CONFIG.get('workflow').itemErrorLimit || 5)) {
                        process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Process has crossed, error limit. Item: ' + workflowCarrier.code + ' requires manual intervation'));
                    } else if (!request.loadInActive && !workflowCarrier.active) {
                        process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00011', 'Item : ' + workflowCarrier.code + ' has been de-activated'));
                    } else {
                        request.workflowCarrier = workflowCarrier;
                        if (!request.workflowCode && !request.workflowHead) {
                            request.workflowCode = request.workflowCarrier.activeHead;
                        }
                        if (!request.workflowAction && !request.actionCode) {
                            request.actionCode = request.workflowCarrier.activeAction.code;
                        }
                        process.nextSuccess(request, response);
                    }
                } else {
                    process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, could not found workflow carrier for code: ' + carrierCode));
                }
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    createNewCarrier: function (request, response, process) {
        this.LOG.debug('Creating new workflow carrier');
        if (!request.workflowCarrier && request.carrier) {
            request.workflowCarrier = _.merge({}, request.carrier);
            request.workflowCarrier.active = (item.active === undefined) ? true : item.active;
            request.workflowCarrier.event = request.workflowCarrier.event || {};
            request.workflowCarrier.event.enabled = request.workflowCarrier.event.enabled || false;
            request.workflowCarrier.type = request.workflowCarrier.type || ENUMS.WorkflowCarrierType.FIXED.key;
            request.workflowCarrier.state = request.workflowCarrier.state || ENUMS.WorkflowActionState.NEW.key;
            let carrierState = {
                status: ENUMS.WorkflowCarrierState.INIT.key,
                description: 'Carrier initialized'
            };
            request.workflowCarrier.currentState = carrierState;
            request.workflowCarrier.states = [carrierState];
            process.nextSuccess(request, response);
        } else {
            process.nextSuccess(request, response);
        }
    },
    verifyWorkflowCarrier: function (request, response, process) {
        if (!request.workflowCarrier) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, none workflow carrier found with code: ' + (request.carrierCode || request.carrier.code)));
        } else {
            process.nextSuccess(request, response);
        }
    }

};
