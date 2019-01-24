/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    postInit: function (options) {
        return new Promise((resolve, reject) => {
            SERVICE.DefaultSearchEngineConnectionHandlerService.createSearchConnections().then(success => {
                SERVICE.DefaultSearchSchemaHandlerService.prepareSearchSchema().then(success => {
                    SERVICE.DefaultSearchModelHandlerService.prepareSearchModels().then(success => {
                        SERVICE.DefaultSearchModelHandlerService.updateIndexesMapping().then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    }
};