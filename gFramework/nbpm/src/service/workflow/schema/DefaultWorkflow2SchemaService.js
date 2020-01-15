/*
	Nodics - Enterprice Micro-Services Management Framework

	Copyright (c) 2017 Nodics All rights reserved.

	This software is the confidential and proprietary information of Nodics ("Confidential Information")
	You shall not disclose such Confidential Information and shall use it only in accordance with the
	terms of the license agreement you entered into with Nodics
*/

module.exports = {

    remove: function (request) {
        return Promise.reject('This operation is not supported, please use save operation with value active: false');
    },
    removeById: function (ids, tenant) {
        return Promise.reject('This operation is not supported, please use save operation with value active: false');
    },
    removeByCode: function (codes, tenant) {
        return Promise.reject('This operation is not supported, please use save operation with value active: false');
    },
    update: function (request) {
        return Promise.reject('This operation is not supported, please use save operation with value active: false');
    },

    workflow2SchemaUpdateEventHandler: function (request) {
        return new Promise((resolve, reject) => {
            try {
                let modelObject = NODICS.getModels(request.moduleName, tntCode)[UTILS.createModelName(request.schemaName)];
                if (!modelObject.workflowCodes) modelObject.workflowCodes = [];
                if (!request.active && modelObject.workflowCodes.includes(request.workflowCode)) {
                    modelObject.workflowCodes.splice(modelObject.workflowCodes.indexOf(request.workflowCode), 1);
                } else if (request.active && !modelObject.workflowCodes.includes(request.workflowCode)) {
                    modelObject.workflowCodes.push(request.workflowCode);
                }
                resolve('Workflow code updated on cluster: ' + CONFIG.get('clusterId'));
            } catch (error) {
                reject(error);
            }
        });
    }
};