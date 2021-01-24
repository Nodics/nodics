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

    routerUpdateEventHandler: function (request) {
        let data = request.event.data;
        return new Promise((resolve, reject) => {
            if (!data.models || data.models.length <= 0) {
                reject(new CLASSES.NodicsError('ERR_SYS_00001', 'ClassName can not be null or empty'));
            }
            let query = {};
            if (data.propertyName === '_id') {
                data.models = data.models.map(id => {
                    return SERVICE.DefaultDatabaseConfigurationService.toObjectId(NODICS.getModels(request.moduleName, request.tenant)[data.modelName], id);
                });
            }
            query[data.propertyName] = {
                $in: data.models
            };
            this.get({
                authData: request.authData,
                tenant: request.tenant,
                searchOptions: {
                    projection: { _id: 0 }
                },
                query: query
            }).then(success => {
                if (success.result && success.result.length > 0) {
                    let routers = {};
                    success.result.forEach(routerDefinition => {
                        routers[routerDefinition.moduleName] = {};
                        routers[routerDefinition.moduleName].tempGroup = {};
                        routers[routerDefinition.moduleName].tempGroup[routerDefinition.code] = routerDefinition;
                        SERVICE.DefaultRouterService.registerRouter(routers).then(success => {
                            resolve('Routers successfully activated');
                        }).catch(error => {
                            reject(error);
                        });
                    });
                } else {
                    _self.LOG.error('Could not found any data for routers name ' + data.models);
                    reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Could not found any data for routers name ' + data.models));
                }
            }).catch(error => {
                reject(new CLASSES.WorkflowError(error, null, 'ERR_WF_00000'));
            });
        });
    },

    loadPersistedRouters: function () {
        return new Promise((resolve, reject) => {
            this.get({
                tenant: 'default'
            }).then(success => {
                try {
                    let routers = {};
                    if (success.result && success.result.length > 0) {
                        success.result.forEach(routerDefinition => {
                            routers[routerDefinition.moduleName] = {};
                            routers[routerDefinition.moduleName].tempGroup = {};
                            routers[routerDefinition.moduleName].tempGroup[routerDefinition.code] = routerDefinition;
                        });
                    }
                    SERVICE.DefaultRouterService.registerRouter(routers).then(success => {
                        resolve('Router successfully activated');
                    }).catch(error => {
                        reject(error);
                    });
                } catch (error) {
                    reject(error);
                }
            }).catch(error => {
                reject(error);
            });
        });
    },

    remove: function (request) {
        return new Promise((resolve, reject) => {
            reject(new CLASSES.NodicsError('ERR_SYS_00002', 'This operation is not supported currently'));
        });
    },
    removeById: function (ids, tenant) {
        return new Promise((resolve, reject) => {
            reject(new CLASSES.NodicsError('ERR_SYS_00002', 'This operation is not supported currently'));
        });
    },
    removeByCode: function (codes, tenant) {
        return new Promise((resolve, reject) => {
            reject(new CLASSES.NodicsError('ERR_SYS_00002', 'This operation is not supported currently'));
        });
    }
};