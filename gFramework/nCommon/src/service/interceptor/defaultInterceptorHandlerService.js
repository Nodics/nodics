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

    buildInterceptors: function (rawInterceptors) {
        let finalInterceptors = {};
        try {
            let defaultInterceptors = _.merge({}, rawInterceptors.default);
            _.each(rawInterceptors, (entityObject, entityName) => {
                if (entityName !== 'default') {
                    let entityInterceptors = _.merge(_.merge({}, defaultInterceptors), entityObject || {});
                    if (!finalInterceptors[entityName]) finalInterceptors[entityName] = {};
                    _.each(entityInterceptors, (interceptorObject, interceptorName) => {
                        if (!finalInterceptors[entityName][interceptorObject.type]) finalInterceptors[entityName][interceptorObject.type] = [];
                        finalInterceptors[entityName][interceptorObject.type].push(interceptorObject);
                    });
                }
            });
            _.each(finalInterceptors, (entityObject, entityName) => {
                _.each(entityObject, (typeInterceptors, typeName) => {
                    let indexedInterceptors = UTILS.sortObject(typeInterceptors, 'index');
                    let list = [];
                    if (indexedInterceptors) {
                        _.each(indexedInterceptors, (intList, index) => {
                            list = list.concat(intList);
                        });
                        finalInterceptors[entityName][typeName] = list;
                    }
                });
            });
        } catch (error) {
            throw (error);
        }
        //(util.inspect(finalInterceptors, false, 6));
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
    }
};