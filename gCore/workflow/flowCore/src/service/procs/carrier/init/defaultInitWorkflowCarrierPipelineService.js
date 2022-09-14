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
    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating request to init item with workflow');
        if (!request.tenant) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, tenant can not be null or empty'));
        } else if (!request.workflowCode && !request.carrierCode) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, workflowCode can not be null or empty'));
        } else if (!request.carrier && !request.carrier.code) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, carrier detail with code, can not be null or empty'));
        } else {
            process.nextSuccess(request, response);
        }

    },
    checkUpdateRequest: function (request, response, process) {
        try {
            SERVICE.DefaultWorkflowCarrierService.get({
                tenant: request.tenant,
                options: {
                    recursive: true
                },
                query: {
                    code: request.carrier.code
                }
            }).then(success => {
                if (success.result && success.result.length > 0) {
                    request.workflowCarrier = success.result[0];
                    response.targetNode = 'carrierUpdate';
                } else {
                    response.targetNode = 'carrierInit';
                }
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } catch (error) {
            process.error(request, response, error);
        }
    },
    checkValidRequest: function (request, response, process) {
        if ((!request.workflowCarrier.sourceDetail.moduleName || (!request.workflowCarrier.sourceDetail.schemaName && !request.workflowCarrier.sourceDetail.indexName)) &&
            !request.workflowCarrier.sourceDetail.endPoint) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, carrier contain invalid source detail'));
        } else if (request.addedNewItems && request.workflowCarrier.type === ENUMS.WorkflowCarrierType.FIXED.key && request.workflowCarrier.currentState.state != ENUMS.WorkflowCarrierState.INIT.key) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, items can not be added in FIXED carrier, after its released'));
        } else if (request.addedNewItems && !request.workflowAction.isNewItemsAllowed) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, items can not be added, action not allow this operation'));
        } else {
            process.nextSuccess(request, response);
        }
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
