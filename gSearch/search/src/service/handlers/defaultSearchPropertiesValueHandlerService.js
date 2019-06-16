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

    processValueProviders: function (request, count = 0) {
        return new Promise((resolve, reject) => {
            let searchModel = request.header.local.searchModel;
            let indexDef = searchModel.indexDef;
            if (count < request.models.length && !UTILS.isBlank(indexDef.properties)) {
                this.processPropertiesValueProvider({
                    model: request.models[count],
                    indexDef: indexDef,
                    properties: Object.keys(indexDef.properties)
                }).then(success => {
                    this.processValueProviders(request, ++count).then(success => {
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    },

    processPropertiesValueProvider: function (request) {
        return new Promise((resolve, reject) => {
            if (request.properties && request.properties.length > 0) {
                let propName = request.properties.shift();
                let propDef = request.indexDef.properties[propName];
                this.processValueProvider(request.model, propName, propDef).then(success => {
                    this.processPropertiesValueProvider(request).then(success => {
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    },

    processValueProvider: function (model, propName, propDef) {
        return new Promise((resolve, reject) => {
            if (propDef.valueProvider) {
                let valueProviderServiceName = propDef.valueProvider.substring(0, propDef.valueProvider.indexOf('.'));
                let valueProviderOperationName = propDef.valueProvider.substring(propDef.valueProvider.indexOf('.') + 1, propDef.valueProvider.length);
                SERVICE[valueProviderServiceName][valueProviderOperationName](model).then(value => {
                    model[propName] = value;
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    }
};