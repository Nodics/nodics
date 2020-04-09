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
        } else if (!request.itemType && (request.itemType !== ENUMS.WorkflowItemType.INTERNAL.key || request.itemType !== ENUMS.WorkflowItemType.EXTERNAL.key)) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, itemType can not be null or empty'));
        } else if (!request.item) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, item can not be null or empty'));
        } else if (!request.workflowCode) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, workflowCode can not be null or empty'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    checkUpdateRequest: function (request, response, process) {
        let item = request.item;
        try {
            SERVICE.DefaultWorkflowItemService.get({
                tenant: request.tenant,
                query: {
                    code: item.code
                }
            }).then(success => {
                if (success.result && success.result.length > 0) {
                    response.targetNode = 'itemUpdate';
                } else {
                    response.targetNode = 'itemInit';
                }
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } catch (error) {
            process.error(request, response, error);
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
