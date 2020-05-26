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
        process.nextSuccess(request, response);
    },
    prepareModels: function (request, response, process) {
        this.LOG.debug('Preparing model to update schema item');
        let carrierData = request.data.carrier;
        let splitData = request.data.splitData;
        request.models = [];
        if (request.schemaModels && request.schemaModels.length > 0) {
            if (!UTILS.isBlank(splitData)) {
                Object.keys(splitData).forEach(newCarrierCode => {
                    let newModels = splitData[newCarrierCode];
                    if (newModels && newModels.length > 0) {
                        newModels.forEach(newModel => {
                            let originalModel = request.schemaModels.filter(function (model) {
                                return model.code === newModel.originalCode;
                            });
                            if (originalModel && originalModel.length === 1) {
                                let newItem = _.merge(_.merge({}, originalModel[0]), {
                                    code: newModel.code,
                                    workflow: {
                                        carrierCode: carrierData.code,
                                        activeHead: carrierData.activeHead,
                                        activeAction: carrierData.activeAction,
                                        state: carrierData.state,
                                        heads: carrierData.heads
                                    }
                                });
                                if (carrierData.actions) {
                                    newItem.workflow.actions = carrierData.actions;
                                }
                                delete newItem._id;
                                request.models.push(newItem);
                            } else {
                                throw new Error('Could not found original item for code: ' + newModel.originalCode);
                            }
                        });
                    }
                });
            }
            request.schemaModels.forEach(schemaModel => {
                let newItem = {
                    workflow: {
                        carrierCode: carrierData.code,
                        activeHead: carrierData.activeHead,
                        activeAction: carrierData.activeAction,
                        state: carrierData.state,
                        heads: carrierData.heads
                    }
                };
                if (carrierData.actions) {
                    newItem.workflow.actions = carrierData.actions;
                }
                request.models.push(_.merge(schemaModel, newItem));
            });
        }
        let sourceDetail = carrierData.sourceDetail;
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
        process.nextSuccess(request, response);

    },
    updateSchemaItem: function (request, response, process) {
        this.LOG.debug('Updating schema item for evaluated channels');
        try {
            request.schemaService.saveAll({
                ignoreWorkflowEvent: true,
                tenant: request.tenant,
                models: request.models
            }).then(success => {
                if (success.success) {
                    process.stop(request, response, success);
                } else {
                    if (!response.error) {
                        response.error = new CLASSES.WorkflowError('Failed saving channel evaluated items');
                    }
                    success.errors.forEach(error => {
                        response.error.add(error);
                    });
                    process.error(request, response);
                }
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