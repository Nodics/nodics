/*
	Nodics - Enterprice Micro-Services Management Framework

	Copyright (c) 2017 Nodics All rights reserved.

	This software is the confidential and proprietary information of Nodics ("Confidential Information")
	You shall not disclose such Confidential Information and shall use it only in accordance with the
	terms of the license agreement you entered into with Nodics
*/

module.exports = {

    remove: function (request) {
        return Promise.reject(new CLASSES.WorkflowError('ERR_WF_00002', 'Please use save operation with value active: false'));
    },
    removeById: function (ids, tenant) {
        return Promise.reject(new CLASSES.WorkflowError('ERR_WF_00002', 'Please use save operation with value active: false'));
    },
    removeByCode: function (codes, tenant) {
        return Promise.reject(new CLASSES.WorkflowError('ERR_WF_00002', 'Please use save operation with value active: false'));
    },
    update: function (request) {
        return Promise.reject(new CLASSES.WorkflowError('ERR_WF_00002', 'Please use save operation with value active: false'));
    },

    workflow2SchemaUpdateEventHandler: function (request) {
        return new Promise((resolve, reject) => {
            try {
                let event = request.event;
                let data = event.data;
                let modelObject = NODICS.getModels(data.moduleName, request.tenant)[UTILS.createModelName(data.schemaName)];
                if (!modelObject.workflowCodes) modelObject.workflowCodes = [];
                if (!data.active && modelObject.workflowCodes.includes(data.workflowCode)) {
                    modelObject.workflowCodes.splice(modelObject.workflowCodes.indexOf(data.workflowCode), 1);
                    data.events.forEach(event => {
                        event.enabled = false;
                    });
                } else if (data.active && !modelObject.workflowCodes.includes(data.workflowCode)) {
                    modelObject.workflowCodes.push(data.workflowCode);
                }
                SERVICE.DefaultEventService.registerModuleEvents(data.moduleName, data.events);
                resolve('Workflow code updated on cluster: ' + CONFIG.get('clusterId'));
            } catch (error) {
                reject(new CLASSES.WorkflowError(error, null, 'ERR_WF_00000'));
            }
        });
    }
};