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

    loadRawInterceptors: function (rawInterceptors) {
        let interceptors = {};
        Object.keys(rawInterceptors).forEach(interceptorName => {
            let interceptor = rawInterceptors[interceptorName];
            if (!interceptor.type || !ENUMS.InterceptorType.isDefined(interceptor.type)) {
                this.LOG.error('Type within interceptor definition is invalid for : ' + interceptorName);
                throw new CLASSES.NodicsError('ERR_SYS_00000', 'Type within interceptor definition is invalid for : ' + interceptorName);
            } else if (!interceptor.trigger) {
                this.LOG.error('trigger within interceptor definition can not be null or empty: ' + interceptorName);
                throw new CLASSES.NodicsError('ERR_SYS_00000', 'Trigger within interceptor definition can not be null or empty: ' + interceptorName);
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
        SERVICE.DefaultInterceptorConfigurationService.setRawInterceptors(_.merge(
            SERVICE.DefaultInterceptorConfigurationService.getRawInterceptors(),
            interceptors
        ));
    },

    handleInterceptorChangeEvent: function (interceptor) {
        return new Promise((resolve, reject) => {
            SERVICE.DefaultPipelineService.start('interceptorUpdatedPipeline', {
                code: interceptor.code
            }, {}).then(success => {
                resolve('Interceptor updated successfully');
            }).catch(error => {
                reject(error);
            });
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