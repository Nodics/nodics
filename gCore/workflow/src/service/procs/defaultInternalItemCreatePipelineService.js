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
        this.LOG.debug('Validating request to assign item with workflow');
        if (!request.moduleName) {
            process.error(request, response, 'Invalid request, module name can not be null or empty');
        } else if (!request.schemaName && !request.indexName) {
            process.error(request, response, 'Invalid request, schema name or index name can not be null or empty');
        } else if (!request.itemCode) {
            process.error(request, response, 'Invalid request, workflow code or workflow item can not be null or empty');
        } else {
            process.nextSuccess(request, response);
        }
    },

    loadWorkflowItem: function (request, response, process) {
        this.LOG.debug('Creating new internal workflow item');
        request.workflowItem = {
            code: request.moduleName + '_' + (request.schemaName || request.indexName) + '_' + request.itemCode,
            active: true,
            item: {
                type: ENUMS.WorkflowItemType.INTERNAL.key,
                detail: {
                    code: request.itemCode,
                    moduleName: request.moduleName,
                    indexName: request.indexName,
                    schemaName: request.schemaName
                }
            }
        };
        process.nextSuccess(request, response);
    }
};
