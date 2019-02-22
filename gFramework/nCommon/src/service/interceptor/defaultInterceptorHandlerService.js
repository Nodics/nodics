/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {

    buildInterceptors: function (interceptors) {
        let finalInterceptors = {};
        try {
            let defaultInterceptors = _.merge({}, interceptors.default);
            _.each(NODICS.getModules(), (moduleObject, moduleName) => {
                if (!finalInterceptors[moduleName]) {
                    finalInterceptors[moduleName] = {};
                }
                let moduleInterceptors = _.merge({}, interceptors[moduleName]);
                let moduleDefault = _.merge(_.merge({}, defaultInterceptors), moduleInterceptors.default || {});
                _.each(moduleObject.models, (tenantObject, tenantName) => {
                    _.each(tenantObject.master, (model, modelName) => {
                        let modelInterceptors = _.merge({}, moduleInterceptors[model.schemaName]);
                        if (!finalInterceptors[moduleName][model.schemaName]) {
                            finalInterceptors[moduleName][model.schemaName] = {};
                        }
                        let interceptorPool = finalInterceptors[moduleName][model.schemaName];
                        _.each(moduleDefault, (interceptor, interceptorName) => {
                            if (!interceptorPool[interceptor.type]) {
                                interceptorPool[interceptor.type] = [];
                            }
                            interceptorPool[interceptor.type].push(interceptor);
                        });
                        _.each(modelInterceptors, (interceptor, interceptorName) => {
                            if (!interceptorPool[interceptor.type]) {
                                interceptorPool[interceptor.type] = [];
                            }
                            interceptorPool[interceptor.type].push(interceptor);
                        });
                    });
                });
            });
            _.each(finalInterceptors, (moduleInterceptors, moduleName) => {
                _.each(moduleInterceptors, (modelInterceptors, modelName) => {
                    _.each(modelInterceptors, (typeInterceptors, typeName) => {
                        let indexedInterceptors = UTILS.sortObject(typeInterceptors, 'index');
                        let list = [];
                        if (indexedInterceptors) {
                            _.each(indexedInterceptors, (intList, index) => {
                                list = list.concat(intList);
                            });
                            modelInterceptors[typeName] = list;
                        }
                    });
                });
            });
        } catch (error) {
            throw (error);
        }
        console.log(finalInterceptors);
        return finalInterceptors;
    },

    executeInterceptors: function (interceptorList, request, responce) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (interceptorList && interceptorList.length > 0) {
                    let interceptor = interceptorList.shift();
                    let serviceName = interceptor.handler.substring(0, interceptor.handler.indexOf('.'));
                    let functionName = interceptor.handler.substring(interceptor.handler.indexOf('.') + 1, interceptor.handler.length);
                    SERVICE[serviceName][functionName](request, responce).then(success => {
                        _self.executeInterceptors(interceptorList, request, responce).then(success => {
                            resolve(success);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    resolve(true);
                }
            } catch (error) {
                reject(error);
            }
        });
    },

    executeProcessorInterceptors: function (interceptorList, request, responce) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (interceptorList && interceptorList.length > 0) {
                    let interceptor = interceptorList.shift();
                    let serviceName = interceptor.handler.substring(0, interceptor.handler.indexOf('.'));
                    let functionName = interceptor.handler.substring(interceptor.handler.indexOf('.') + 1, interceptor.handler.length);
                    SERVICE[serviceName][functionName](request, responce).then(success => {
                        _self.executeProcessorInterceptors(interceptorList, request, responce).then(success => {
                            resolve(success);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    resolve(true);
                }
            } catch (error) {
                reject(error);
            }
        });
    },
};