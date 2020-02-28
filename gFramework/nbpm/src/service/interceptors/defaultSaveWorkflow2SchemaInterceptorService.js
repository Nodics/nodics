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

    handlePreSave: function (request, responce) {
        return new Promise((resolve, reject) => {
            //let schemaName = request.model.schemaName;
            request.model.moduleName = request.schemaModel.moduleName;
            resolve(true);
            // throw new Error('Check module name from item model object in request');
            // Object.keys(NODICS.getModules()).forEach(moduleName => {
            //     let moduleObject = NODICS.getModule(moduleName);
            //     if (moduleObject.rawSchema && moduleObject.rawSchema[schemaName]) {
            //         request.model.moduleName = moduleName;
            //     }
            // });
            // if (request.model.moduleName) {
            //     resolve(true);
            // } else {
            //     reject(new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid schemaName, please validate your request: ' + CONFIG.get('clusterId')));
            // }
        });
    }

};