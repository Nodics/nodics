/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.
 */

const _ = require('lodash');
const util = require('util');

module.exports = {

    loadInterceptors: function (rawInterceptors) {
        let interceptors = {};
        return new Promise((resolve, reject) => {
            try {
                Object.keys(rawInterceptors).forEach(interceptorName => {
                    let interceptor = rawInterceptors[interceptorName];
                    if (!interceptor.type || !ENUMS.InterceptorType.isDefined(interceptor.type)) {
                        this.LOG.error('Type within interceptor definition is invalid for : ' + interceptorName);
                        process.exit(1);
                    } else if (!interceptor.trigger) {
                        this.LOG.error('trigger within interceptor definition can not be null or empty: ' + interceptorName);
                        process.exit(1);
                    } else {
                        if (!interceptor.item) {
                            interceptor.item = 'default';
                        }
                        if (!interceptors[interceptor.type]) {
                            interceptors[interceptor.type] = {};
                        }
                        if (!interceptors[interceptor.type][interceptor.item]) {
                            interceptors[interceptor.type][interceptor.item] = {};
                        }
                        if (!interceptors[interceptor.type][interceptor.item][interceptorName]) {
                            interceptors[interceptor.type][interceptor.item][interceptorName] = interceptor;
                        } else {
                            _.merge(interceptors[interceptor.type][interceptor.item][interceptorName], interceptor);
                        }
                    }
                });
                SERVICE.DefaultInterceptorConfigurationService.setRawInterceptors(interceptors);
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },

    refreshInterceptors: function (request) {
        return new Promise((resolve, reject) => {
            try {
                this.loadInterceptors(SERVICE.DefaultFilesLoaderService.loadFiles('/src/interceptors/interceptors.js')).then(() => {
                    if (SERVICE.DefaultDatabaseConfigurationService &&
                        SERVICE.DefaultDatabaseConfigurationService.prepareSchemaInterceptors) {
                        return SERVICE.DefaultDatabaseConfigurationService.prepareSchemaInterceptors();
                    } else {
                        return Promise.resolve(true);
                    }
                }).then(() => {
                    if (SERVICE.DefaultDataConfigurationService &&
                        SERVICE.DefaultDataConfigurationService.prepareImportInterceptors) {
                        return SERVICE.DefaultDataConfigurationService.prepareImportInterceptors();
                    } else {
                        return Promise.resolve(true);
                    }
                }).then(() => {
                    if (SERVICE.DefaultDataConfigurationService &&
                        SERVICE.DefaultDataConfigurationService.prepareExportInterceptors) {
                        return SERVICE.DefaultDataConfigurationService.prepareExportInterceptors();
                    } else {
                        return Promise.resolve(true);
                    }
                }).then(() => {
                    if (SERVICE.DefaultSearchConfigurationService &&
                        SERVICE.DefaultSearchConfigurationService.prepareSearchInterceptors) {
                        return SERVICE.DefaultSearchConfigurationService.prepareSearchInterceptors();
                    } else {
                        return Promise.resolve(true);
                    }
                }).then(() => {
                    if (SERVICE.DefaultCronJobConfigurationService &&
                        SERVICE.DefaultCronJobConfigurationService.prepareJobInterceptors) {
                        return SERVICE.DefaultCronJobConfigurationService.prepareJobInterceptors();
                    } else {
                        return Promise.resolve(true);
                    }
                }).then(() => {
                    if (SERVICE.DefaultWorkflowConfigurationService &&
                        SERVICE.DefaultWorkflowConfigurationService.prepareWorkflowInterceptors) {
                        return SERVICE.DefaultWorkflowConfigurationService.prepareWorkflowInterceptors();
                    } else {
                        return Promise.resolve(true);
                    }
                }).then(() => {
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
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
    }
};