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
        this.LOG.debug('Validating input for workflow evaluated channels');
        if (!request.tenant) {
            process.error(request, response, new CLASSES.WorkflowError('Invalid tenant value'));
        } else if (!request.data || !request.event.detail || UTILS.isBlank(request.event.detail)) {
            process.error(request, response, new CLASSES.WorkflowError('Invalid event data value'));
        } else if (!request.event) {
            process.error(request, response, new CLASSES.WorkflowError('Invalid event value'));
        } else if (!request.data.newItems) {
            process.error(request, response, new CLASSES.WorkflowError('Invalid channel items detail'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    prepareModel: function (request, response, process) {
        this.LOG.debug('Preparing model to update schema item');
        if (request.data.itemDetail.schemName) {
            response.targetNode = 'schemaOperation';
        } else {
            response.targetNode = 'searchOperation';
        }
        process.nextSuccess(request, response);
    },
    prepareSchemaItem: function (request, response, process) {
        this.LOG.debug('Updating schema item for evaluated channels');
        try {
            let data = request.data;
            if (data.newItems && data.newItems.length > 1) {
                request.schemaService.get({
                    tenant: request.tenant,
                    options: {
                        projection: { _id: 0 }
                    },
                    query: {
                        code: data.originalCode,
                        'workflow.refId': data.code
                    }
                }).then(success => {
                    request.models = [];
                    if (success.result && success.result.length > 0) {
                        data.newItems.forEach(item => {
                            if (item.code === data.code) {
                                request.models.push({
                                    code: item.refId,
                                    workflow: {
                                        activeHead: data.activeHead,
                                        activeAction: data.activeAction,
                                        qualifiedChannels: data.qualifiedChannels
                                    }
                                });
                            }
                        });
                    } else {
                        process.error(request, response, new CLASSES.WorkflowError('Invalid data, could not found any item, code: ' + data.originalCode + ' workflow.refId: ' + data.code));
                    }
                }).catch(error => {
                    process.error(request, response, new CLASSES.WorkflowError(error, 'while retrieving an item'));
                });
            } else {
                let item = data.newItems[0];
                request.models = [{
                    code: item.originalCode,
                    workflow: {
                        activeHead: data.activeHead,
                        activeAction: data.activeAction,
                        qualifiedChannel: item.channel
                    }
                }];
            }
        } catch (error) {
            process.error(request, response, new CLASSES.WorkflowError(error, 'while preparing for schema update for qualified channels'));
        }
    },
    updateSchemaItem: function (request, response, process) {
        this.LOG.debug('Updating schema item for evaluated channels');
        try {
            request.schemaService.save({
                tenant: request.tenant,
                model: request.model
            }).then(success => {
                process.stop(request, response, success);
            }).then(error => {
                process.error(request, response, error);
            });
        } catch (error) {
            process.error(request, response, new CLASSES.WorkflowError(error, 'while updating schema item'));
        }
    },
    prepareSearchItem: function (request, response, process) {
        this.LOG.debug('Updating search item for evaluated channels');
        try {
            request.searchService.doSave({
                tenant: request.tenant,
                model: request.model
            }).then(success => {
                process.stop(request, response, success);
            }).then(error => {
                process.error(request, response, error);
            });
        } catch (error) {
            process.error(request, response, new CLASSES.WorkflowError(error, 'while updating schema item'));
        }
    },
    updateSearchItem: function (request, response, process) {
        this.LOG.debug('Updating search item for evaluated channels');
        try {
            request.searchService.doSave({
                tenant: request.tenant,
                model: request.model
            }).then(success => {
                process.stop(request, response, success);
            }).then(error => {
                process.error(request, response, error);
            });
        } catch (error) {
            process.error(request, response, new CLASSES.WorkflowError(error, 'while updating schema item'));
        }
    }
};