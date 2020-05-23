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
        if (!request.tenant) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, tenant can not be null or empty'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    loadWorkflowHead: function (request, response, process) {
        if (!request.workflowHead) {
            request.workflowCode = request.workflowCode || request.workflowCarrier.activeHead;
            if (request.workflowCode) {
                SERVICE.DefaultWorkflowActionService.getWorkflowAction(request.workflowCode, request.tenant).then(workflowHead => {
                    request.workflowHead = workflowHead;
                    if (request.workflowHead.position === ENUMS.WorkflowActionPosition.HEAD.key) {
                        request.workflowHead = workflowHead;
                        process.nextSuccess(request, response);
                    } else {
                        process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid workflow head, workflow head : ' + request.workflowCode + ' not defined position as head'));
                    }
                }).catch(error => {
                    process.error(request, response, error);
                });
            } else {
                process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, could not load workflow action'));
            }
        } else {
            process.nextSuccess(request, response);
        }
    },
    finalizeEventType: function (request, response, process) {
        if (!request.workflowAction || !request.workflowHead) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, workflow action or head can not be null or empty'));
        } else {
            request.workflowAction.endPoint = _.merge(
                _.merge({}, (request.workflowHead.sourceDetail) ? request.workflowHead.sourceDetail.endPoint || {} : {}),
                (request.workflowAction.sourceDetail) ? request.workflowAction.sourceDetail.endPoint || {} : {});
            process.nextSuccess(request, response);
            if (request.workflowCarrier.event.isInternal === undefined) {
                let endPoint = _.merge(request.workflowAction.endPoint, request.workflowCarrier.sourceDetail.endPoint || {});
                request.workflowCarrier.event.isInternal = UTILS.isBlank(endPoint) ? true : false;
            }
            process.nextSuccess(request, response);
        }
    }
};
