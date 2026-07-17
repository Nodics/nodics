/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module gFramework/nbpm/src/service/workflow/schema/DefaultWorkflow2SchemaService
 * @description Implements nbpm default workflow2 schema service business behavior and extension logic.
 * @layer service
 * @owner nbpm
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
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

    /**

     * Removes or clears  information.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    remove: function (request) {
        return Promise.reject(new CLASSES.WorkflowError('ERR_WF_00002', 'Please use save operation with value active: false'));
    },
    /**
     * Removes or clears by id information.
     *
     * @param {*} ids Method input.
     * @param {*} tenant Method input.
     * @returns {*} Method result.
     */
    removeById: function (ids, tenant) {
        return Promise.reject(new CLASSES.WorkflowError('ERR_WF_00002', 'Please use save operation with value active: false'));
    },
    /**
     * Removes or clears by code information.
     *
     * @param {*} codes Method input.
     * @param {*} tenant Method input.
     * @returns {*} Method result.
     */
    removeByCode: function (codes, tenant) {
        return Promise.reject(new CLASSES.WorkflowError('ERR_WF_00002', 'Please use save operation with value active: false'));
    },

    /**

     * Executes workflow2 schema update event handler behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    workflow2SchemaUpdateEventHandler: function (request) {
        return new Promise((resolve, reject) => {
            try {
                let event = request.event;
                let data = event.data;
                if (data.models && data.models.length > 0) {
                    let query = {};
                    let schemaModel = NODICS.getModels(request.moduleName, request.tenant)[data.modelName];
                    if (data.propertyName === '_id') {
                        data.models = data.models.map(id => {
                            return SERVICE.DefaultDatabaseConfigurationService.toObjectId(schemaModel, id);
                        });
                    }
                    query[data.propertyName] = {
                        $in: data.models
                    };
                    SERVICE.DefaultWorkflow2SchemaService.get({
                        authData: request.authData,
                        tenant: request.tenant,
                        searchOptions: {
                            projection: { _id: 0 }
                        },
                        query: query
                    }).then(success => {
                        if (success.result && success.result.length > 0) {
                            success.result.forEach(model => {
                                let modelObject = NODICS.getModels(model.moduleName, request.tenant)[UTILS.createModelName(model.schemaName)];
                                if (!modelObject.workflows) modelObject.workflows = {};
                                modelObject.workflows[model.workflowCode] = _.merge(modelObject.workflows[model.workflowCode] || {}, model);
                                if (!model.active && modelObject.workflows[model.workflowCode]) {
                                    delete modelObject.workflows[model.workflowCode];
                                    Object.keys(model.events).forEach(eventName => {
                                        let event = model.events[eventName];
                                        event.enabled = false;
                                    });
                                }
                                SERVICE.DefaultEventService.registerModuleEvents(model.moduleName, model.events);
                            });
                            resolve('Workflow code updated on cluster: ' + CONFIG.get('clusterId'));
                        } else {
                            reject(new CLASSES.WorkflowError('ERR_WF_00000', 'Could not found items for ids: ' + data.models));
                        }
                    }).catch(error => {
                        reject(new CLASSES.WorkflowError(error, null, 'ERR_WF_00000'));
                    });
                } else {
                    reject(new CLASSES.WorkflowError('ERR_WF_00000', 'Invalid event data, not contain any models'));
                }
            } catch (error) {
                reject(new CLASSES.WorkflowError(error, null, 'ERR_WF_00000'));
            }
        });
    },

    /**

     * Builds workflow2 schema associations data.

     *

     * @returns {*} Method result.

     */

    buildWorkflow2SchemaAssociations: function () {
        return new Promise((resolve, reject) => {
            if (typeof SERVICE.DefaultWorkflow2SchemaService.get !== 'function') {
                this.LOG.warn('Persisted workflow-schema association loading skipped; no workflow-schema model service is available');
                resolve(true);
                return;
            }
            let allPromise = [];
            NODICS.getActiveTenants().forEach(tntCode => {
                allPromise.push(new Promise((resolve, reject) => {
                    SERVICE.DefaultWorkflow2SchemaService.get({
                        tenant: tntCode
                    }).then(response => {
                        if (response.result && response.result.length > 0) {
                            response.result.forEach(data => {
                                if (data.active && NODICS.isModuleActive(data.moduleName)) {
                                    let modelObject = NODICS.getModels(data.moduleName, tntCode)[UTILS.createModelName(data.schemaName)];
                                    if (modelObject) {
                                        if (!modelObject.workflows) modelObject.workflows = {};
                                        if (!modelObject.workflows[data.workflowCode]) modelObject.workflows[data.workflowCode] = data;
                                    }
                                    SERVICE.DefaultEventService.registerModuleEvents(data.moduleName, data.events);
                                }
                            });
                        }
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                }));
            });
            if (allPromise.length > 0) {
                Promise.all(allPromise).then(done => {
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    }
};
