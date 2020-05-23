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
        this.LOG.debug('Validating input for workflow item assigned process');
        if (!request.tenant) {
            process.error(request, response, new CLASSES.WorkflowError('Invalid tenant value'));
        } else if (!request.data || !request.data.carrier || !request.data.carrier.sourceDetail || UTILS.isBlank(request.data.carrier.sourceDetail)) {
            process.error(request, response, new CLASSES.WorkflowError('Invalid event data value'));
        } else if (request.data.carrier.type === ENUMS.WorkflowCarrierType.FIXED.key && (!request.data.carrier.items || request.data.carrier.items.length <= 0)) {
            process.error(request, response, new CLASSES.WorkflowError('Invalid data, fix carrier without item is invalid'));
        } else if (!request.event) {
            process.error(request, response, new CLASSES.WorkflowError('Invalid event value'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    checkOperation: function (request, response, process) {
        this.LOG.debug('Validating input for workflow item assigned process');
        let sourceDetail = request.data.carrier.sourceDetail;
        if (!sourceDetail.schemaName && !sourceDetail.indexName) {
            process.error(request, response, new CLASSES.WorkflowError('Invalid internal item sourceDetail, schemaName and indexName both can not be null'));
        } else {
            if (sourceDetail.schemaName) {
                response.targetNode = 'schemaOperation';
            } else {
                response.targetNode = 'searchOperation';
            }
            process.nextSuccess(request, response);
        }
    },
    loadSchemaService: function (request, response, process) {
        this.LOG.debug('Validating input for workflow item assigned process');
        let sourceDetail = request.data.carrier.sourceDetail;
        request.schemaService = SERVICE['Default' + sourceDetail.schemaName.toUpperCaseFirstChar() + 'Service'];
        if (request.schemaService) {
            process.nextSuccess(request, response);
        } else {
            process.error(request, response, new CLASSES.WorkflowError('Invalid schemaName, could not found any service'));
        }
    },

    loadSchemaModel: function (request, response, process) {
        this.LOG.debug('Loading schema item for triggered workflow');
        let carrierData = request.data.carrier;
        if (carrierData.items && carrierData.items.length > 0) {
            request.schemaService.get({
                tenant: request.tenant,
                searchOptions: {
                    projection: { _id: 0 }
                },
                query: {
                    code: {
                        $in: carrierData.items.map((item, index) => {
                            return item.originalCode || item.code;
                        })
                    }
                }
            }).then(success => {
                if (success.result && success.result.length > 0) {
                    request.schemaModels = success.result;
                    process.nextSuccess(request, response);
                } else {
                    process.error(request, response, new CLASSES.WorkflowError('Schema item not found for code: ' + itemCode));
                }
            }).catch(error => {
                process.error(request, response, new CLASSES.WorkflowError(error, 'Could not load item for the workflow: ' + itemCode));
            });
        } else {
            process.nextSuccess(request, response);
        }

    },
    loadSearchService: function (request, response, process) {
        this.LOG.debug('Validating input for workflow item assigned process');
        process.error(request, response, new CLASSES.WorkflowError('Not yet implemented this functionality loadSearchService: DefaultWorkflowProcessPreparePipelineService'));
        // request.searchService = SERVICE['Default' + itemDetail.indexName.toUpperCaseFirstChar() + 'Service'];
        // if (request.searchService) {
        //     process.nextSuccess(request, response);
        // } else {
        //     process.error(request, response, new CLASSES.WorkflowError('Invalid indexName, could not found any service'));
        // }
    },
    loadSearchModel: function (request, response, process) {
        this.LOG.debug('Loading search item for triggered workflow');
        process.error(request, response, new CLASSES.WorkflowError('Not yet implemented this functionality loadSearchModel: DefaultWorkflowProcessPreparePipelineService'));
        // request.searchService.doGet({
        //     tenant: request.tenant,
        //     query: {
        //         code: request.data.originalCode
        //     }
        // }).then(success => {
        //     if (success.result && success.result.length > 0) {
        //         request.schemaModel = success.result[0];
        //     } else {
        //         process.error(request, response, new CLASSES.WorkflowError('Search item not found for code: ' + request.data.originalCode));
        //     }
        // }).catch(error => {
        //     process.error(request, response, new CLASSES.WorkflowError(error, 'Could not load item for the workflow: ' + request.data.originalCode));
        // });
    },
    validateresponse: function (request, response, process) {
        this.LOG.debug('Validating loaded response, number of models');
        let carrierData = request.data.carrier;
        if ((carrierData.items && carrierData.items.length > 0) && (request.schemaModels && request.schemaModels.length === carrierData.items.length)) {
            if (request.schemaModels && request.schemaModels.length === carrierData.items.length) {
                process.nextSuccess(request, response);
            } else {
                process.error(request, response, new CLASSES.WorkflowError('Item count mismatch in carrier items and loaded items'));
            }
        } else {
            process.nextSuccess(request, response);
        }
    }
};