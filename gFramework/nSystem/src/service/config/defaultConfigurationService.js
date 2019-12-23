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

    changeConfig: function (request) {
        return new Promise((resolve, reject) => {
            try {
                SERVICE.DefaultEventService.publish({
                    tenant: request.tenant,
                    active: true,
                    event: 'configurationChange',
                    sourceName: request.moduleName,
                    sourceId: CONFIG.get('nodeId'),
                    target: request.modelName,
                    state: "NEW",
                    type: 'SYNC',
                    targetType: ENUMS.TargetType.MODULE_NODES.key,
                    data: request.config
                }).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });

            } catch (error) {
                reject({
                    success: false,
                    code: 'ERR_EVNT_00000',
                    msg: 'Facing issue while publishing update cache event : ' + error.toString()
                });
            }
        });
    },

    handleConfigurationChangeEvent: function (request) {
        return new Promise((resolve, reject) => {
            try {
                CONFIG.changeTenantProperties(request.config, request.tenant);
                resolve({
                    success: true,
                    code: 'SUC_SYS_00000',
                    msg: 'Configuration update successfully'
                });
            } catch (error) {
                reject({
                    success: false,
                    code: 'ERR_SYS_00000',
                    error: error
                });
            }
        });
    }
};