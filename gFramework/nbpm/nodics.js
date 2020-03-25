/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    /**
     * This function is used to initiate module loading process. If there is any functionalities, required to be executed on module loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize module loading process. If there is any functionalities, required to be executed after module loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            this.LOG.debug('Updating schema and workflow association');
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
                                        if (!modelObject.workflowCodes) modelObject.workflowCodes = [];
                                        if (!modelObject.workflowCodes.includes(data.workflowCode)) modelObject.workflowCodes.push(data.workflowCode);
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
    },
};