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
        } else if (!request.data || !request.data.sourceDetail || UTILS.isBlank(request.data.sourceDetail)) {
            process.error(request, response, new CLASSES.WorkflowError('Invalid event data value'));
        } else if (!request.event) {
            process.error(request, response, new CLASSES.WorkflowError('Invalid event value'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    prepareModel: function (request, response, process) {
        this.LOG.debug('Preparing model to update schema item');
        let data = request.data;
        request.model = _.merge(request.schemaModel, {
            workflow: {
                activeHead: data.activeHead,
                activeAction: data.activeAction,
                state: data.state
            }
        });
        let sourceDetail = data.sourceDetail;
        if (sourceDetail.schemaName) {
            response.targetNode = 'schemaOperation';
            process.nextSuccess(request, response);
        } else if (sourceDetail.indexName) {
            response.targetNode = 'searchOperation';
            process.nextSuccess(request, response);
        } else {
            process.error(request, response, new CLASSES.WorkflowError('Invalid item sourceDetail, could not find operation type'));
        }
    },
    updateSchemaItem: function (request, response, process) {
        this.LOG.debug('Updating schema item for assigned item');
        try {
            request.schemaService.save({
                ignoreWorkflowEvent: true,
                tenant: request.tenant,
                model: request.model
            }).then(success => {
                process.stop(request, response, success);
            }).catch(error => {
                process.error(request, response, error);
            });
        } catch (error) {
            process.error(request, response, new CLASSES.WorkflowError(error, 'while updating schema item'));
        }
    },
    updateSearchItem: function (request, response, process) {
        this.LOG.debug('Updating search item for assigned item');
        try {
            request.searchService.doSave({
                tenant: request.tenant,
                model: request.model
            }).then(success => {
                process.stop(request, response, success);
            }).catch(error => {
                process.error(request, response, error);
            });
        } catch (error) {
            process.error(request, response, new CLASSES.WorkflowError(error, 'while updating schema item'));
        }
    }
};