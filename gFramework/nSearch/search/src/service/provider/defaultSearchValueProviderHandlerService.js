/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {

    handleValueProviders: function (valueProviders, model) {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.handleValueProvider(Object.keys(valueProviders), valueProviders, model).then(success => {
                resolve(true);
            }).catch(error => {
                reject(error);
            });
        });
    },
    handleValueProvider: function (properties, valueProviders, model) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (properties && properties.length > 0) {
                    let property = properties.shift();
                    let valueProvider = valueProviders[property];
                    let serviceName = valueProvider.substring(0, valueProvider.lastIndexOf('.'));
                    let operation = valueProvider.substring(valueProvider.lastIndexOf('.') + 1, valueProvider.length);
                    SERVICE[serviceName][operation](model).then(success => {
                        model[property] = success;
                        _self.handleValueProvider(properties, valueProviders, model).then(success => {
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
            } catch (error) {
                reject(error);
            }
        });
    }
};