/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {

    generateAuthToken: function(modules) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (!UTILS.isBlank(modules)) {
                let moduleName = Object.keys(modules)[0];
                let config = modules[moduleName];
                delete modules[moduleName];

                config.source = moduleName;
                let options = {
                    moduleName: 'profile',
                    methodName: 'POST',
                    apiName: 'authenticate',
                    header: config
                };
                let requestUrl = SERVICE.ModuleService.buildRequest(options);
                SERVICE.ModuleService.fetch(requestUrl).then(success => {
                    //console.log(success);
                    let moduleObject = NODICS.getModule(moduleName);
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
                }).catch(error => {
                    console.log('   ERROR: While hitting url: ', requestUrl);
                    console.log('   ', error);
                    reject(error);
                });
            } else {
                reject('There are no modules to allocate default auth token');
            }
        });
    }
};