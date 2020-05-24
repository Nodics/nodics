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
        this.LOG.debug('Validating input for workflow evaluated channels');
        process.stop(request, response, 'This functionlity is not yet implemented');
        // process.nextSuccess(request, response);
    },
    prepareModels: function (request, response, process) {
        this.LOG.debug('Preparing model to update schema item');
        let sourceDetail = request.data.sourceDetail;
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
    prepareSchemaItem: function (request, response, process) {
        this.LOG.debug('Updating schema item for evaluated channels');
        try {
            let data = request.data;
            request.models = [];
            let currentModel = _.merge({}, request.schemaModel);
            delete currentModel._id;
            data.items.forEach(item => {
                let dataModel = _.merge(_.merge({}, request.schemaModel), {
                    code: item.code,
                    workflow: {
                        activeHead: data.activeHead,
                        activeAction: data.activeAction,
                        qualifiedChannel: item.channel,
                        state: data.state
                    }
                });
                if (data.originalCode) {
                    dataModel.originalCode = data.originalCode;
                }
                request.models.push(dataModel);
            });
            process.nextSuccess(request, response);
        } catch (error) {
            process.error(request, response, new CLASSES.WorkflowError(error, 'while preparing for schema update for qualified channels'));
        }
    },
    updateSchemaItem: function (request, response, process) {
        this.LOG.debug('Updating schema item for evaluated channels');
        try {
            request.schemaService.saveAll({
                ignoreWorkflowEvent: true,
                tenant: request.tenant,
                models: request.models
            }).then(success => {
                process.stop(request, response, success);
            }).catch(error => {
                process.error(request, response, error);
            });
        } catch (error) {
            process.error(request, response, new CLASSES.WorkflowError(error, 'while updating schema item'));
        }
    },
    prepareSearchItem: function (request, response, process) {
        this.LOG.debug('Updating search item for evaluated channels');
        process.nextSuccess(request, response);
    },
    updateSearchItem: function (request, response, process) {
        this.LOG.debug('Updating search item for evaluated channels');
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