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
            process.error(request, response, 'Invalid request, tenant can not be null or empty');
        } else if (!request.itemType && (request.itemType !== ENUMS.WorkflowItemType.INTERNAL.key || request.itemType !== ENUMS.WorkflowItemType.EXTERNAL.key)) {
            process.error(request, response, 'Invalid request, itemType can not be null or empty');
        } else if (!request.item) {
            process.error(request, response, 'Invalid request, item can not be null or empty');
        } else if (!request.workflowCode) {
            process.error(request, response, 'Invalid request, workflowCode can not be null or empty');
        } else {
            request.optType = 'init';
            process.nextSuccess(request, response);
        }
    },

    loadWorkflowHead: function (request, response, process) {
        SERVICE.DefaultWorkflowHeadService.getWorkflowHead(request).then(workflowHead => {
            request.workflowHead = workflowHead;
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    successEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed successfully');
        response.success.msg = SERVICE.DefaultStatusService.get(response.success.code || 'SUC_SYS_00000').message;
        process.resolve(response.success);
    },
    handleError: function (request, response, process) {
        this.LOG.error('Request has been processed and got errors');
        response.error = (response.errors && response.errors.length === 1) ? response.errors[0] : response.error;
        if (!(response.error instanceof Error) || !UTILS.isObject(response.error)) {
            response.error = {
                message: response.error
            };
        }
        response.error.code = response.error.code || 'ERR_SYS_00000';
        SERVICE.DefaultPipelineService.start('handleWorkflowErrorsPipeline', request, response).then(success => {
            process.reject(response.error);
        }).catch(error => {
            process.reject(response.error);
        });
    }
};
