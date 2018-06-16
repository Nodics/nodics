/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {

    prepareURL: function (config) {
        return SERVICE.ModuleService.buildRequest({
            moduleName: 'profile',
            methodName: 'POST',
            apiName: 'authenticate',
            header: config
        });
    },

    generateAuthToken: function (modules) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (!UTILS.isBlank(modules)) {
                let moduleName = Object.keys(modules)[0];
                let config = modules[moduleName];
                delete modules[moduleName];
                _self.authTokenForModule(moduleName, config, modules).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve('There are no modules to allocate default auth token');
            }
        });
    },

    authTokenForModule: function (moduleName, config, modules) {
        let _self = this;
        return new Promise((resolve, reject) => {
            let moduleObject = NODICS.getModule(moduleName);
            if (moduleObject) {
                config.source = moduleName;
                let requestUrl = _self.prepareURL(config);
                SERVICE.ModuleService.fetch(requestUrl).then(success => {
                    if (success.success) {
                        moduleObject.metaData.authToken = success.result.authToken;
                        if (!UTILS.isBlank(modules)) {
                            _self.generateAuthToken(modules).then(success => {
                                resolve(true);
                            }).catch(error => {
                                reject(error);
                            });
                        } else {
                            resolve(success);
                        }
                    } else {
                        reject('Authentication failed for given data');
                    }
                }).catch(error => {
                    this.LOG.error('While hitting url: ', JSON.stringify(requestUrl));
                    this.LOG.error(error);
                    reject(error);
                });
            } else {
                resolve('Invalid configuration for module : ' + moduleName);
            }
        });
    }
};