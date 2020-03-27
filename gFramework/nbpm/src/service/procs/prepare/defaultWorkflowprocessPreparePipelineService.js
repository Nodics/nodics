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
        this.LOG.debug('Validating input for workflow item assigned process');
        if (!request.tenant) {
            process.error(request, response, new CLASSES.WorkflowError('Invalid tenant value'));
        } else if (!request.data || !request.event.detail || UTILS.isBlank(request.event.detail)) {
            process.error(request, response, new CLASSES.WorkflowError('Invalid event data value'));
        } else if (!request.event) {
            process.error(request, response, new CLASSES.WorkflowError('Invalid event value'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    checkOperation: function (request, response, process) {
        this.LOG.debug('Validating input for workflow item assigned process');
        let itemDetail = request.data.detail;
        if (!itemDetail.schemName && !itemDetail.indexName) {
            process.error(request, response, new CLASSES.WorkflowError('Invalid internal item detail, schemaName and indexName both can not be null'));
        } else {
            if (itemDetail.schemName) {
                response.targetNode = 'schemaOperation';
            } else {
                response.targetNode = 'searchOperation';
            }
            process.nextSuccess(request, response);
        }
    },
    loadSchemaService: function (request, response, process) {
        this.LOG.debug('Validating input for workflow item assigned process');
        let itemDetail = request.data.detail;
        request.schemaService = SERVICE['Default' + itemDetail.schemaName.toUpperCaseFirstChar() + 'Service'];
        if (request.schemaService) {
            process.nextSuccess(request, response);
        } else {
            process.error(request, response, new CLASSES.WorkflowError('Invalid schemaName, could not found any service'));
        }
    },
    loadSearchService: function (request, response, process) {
        this.LOG.debug('Validating input for workflow item assigned process');
        request.searchService = SERVICE['Default' + itemDetail.indexName.toUpperCaseFirstChar() + 'Service'];
        if (request.searchService) {
            process.nextSuccess(request, response);
        } else {
            process.error(request, response, new CLASSES.WorkflowError('Invalid indexName, could not found any service'));
        }
    }
};