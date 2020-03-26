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

    createWorkflowCode: function (request, responce) {
        return new Promise((resolve, reject) => {
            try {
                if (request.schemaModel.workflowCodes &&
                    request.schemaModel.workflowCodes.length > 0) {
                    if (!request.model._id && request.model.code && !request.model.workflowRefId) {
                        request.model.wtRefId = request.model.code;
                    }
                }
                resolve(true);
            } catch (error) {
                reject(new CLASSES.WorkflowError('ERR_WF_00000', 'Error while assiging workflow ref id: ' + CONFIG.get('clusterId')));
            }
        });
    },

    handlePreSaveModuleAssignment: function (request, responce) {
        return new Promise((resolve, reject) => {
            try {
                let schemaName = request.model.schemaName;
                Object.keys(NODICS.getModules()).forEach(moduleName => {
                    let moduleObject = NODICS.getModule(moduleName);
                    if (moduleObject.rawSchema && moduleObject.rawSchema[schemaName]) {
                        request.model.moduleName = moduleName;
                        let schemaDef = moduleObject.rawSchema[schemaName].definition;
                        if (!schemaDef.code) {
                            throw new CLASSES.WorkflowError('Invalid schema definition, found schema without code');
                        }
                    }
                });
                if (request.model.moduleName) {
                    resolve(true);
                } else {
                    reject(new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid schemaName, please validate your request: ' + CONFIG.get('clusterId')));
                }
            } catch (error) {
                reject(error);
            }
        });
    },

    handlePreSaveAssignedDefaultEvents: function (request, responce) {
        return new Promise((resolve, reject) => {
            try {
                request.model.events = _.merge(_.merge({}, CONFIG.get('defaultWorkflowEvents')), request.model.events);
                Object.keys(request.model.events).forEach(eventName => {
                    let event = request.model.events[eventName];
                    event.event = SERVICE.DefaultWorkflowEventService.createEventName(request.model.schemaName, request.model.workflowCode, event.event);
                });
                resolve(true);
            } catch (error) {
                reject(new CLASSES.WorkflowError('ERR_WF_00000', 'Error while assiging events with schema: ' + CONFIG.get('clusterId')));
            }
        });
    }
};