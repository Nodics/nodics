/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

*/

const _ = require('lodash');
const util = require('util');
let elasticsearch = require('elasticsearch');

module.exports = {

    postInitialize: function () {

    },

    postApp: function () {
        this.createTenantSearchEngines(NODICS.getTenants()).then(success => {
            this.LOG.debug('Search connections has been established successfully');
        }).catch(error => {
            this.LOG.error('Failed establishing connections with search engine');
            this.LOG.error(error);
        });
    },

    getSearchActiveModules: function () {
        let modules = NODICS.getModules();
        let dbModules = [];
        _.each(modules, (value, moduleName) => {
            if (CONFIG.get('search')[moduleName]) {
                dbModules.push(moduleName);
            }
        });
        return dbModules;
    },

    createTenantSearchEngines: function (tntCodes) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (tntCodes && tntCodes.length > 0) {
                    let tntCode = tntCodes.shift();
                    let modules = _self.getSearchActiveModules();
                    _self.createModulesSearchEngines(modules, tntCode).then(success => {
                        _self.createTenantSearchEngines(tntCodes).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject({
                                success: false,
                                code: ''
                            });
                        });
                    }).catch(error => {
                        reject({
                            success: false,
                            code: ''
                        });
                    });
                } else {
                    resolve(true);
                }
            } catch (err) {
                reject(err);
            }
        });
    },

    createModulesSearchEngines: function (modules, tntCode) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (modules && modules.length > 0) {
                    let moduleName = modules.shift();
                    _self.createModuleSearchEngines(moduleName, tntCode).then(success => {
                        _self.createModulesSearchEngines(modules, tntCode).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject({
                                success: false,
                                code: ''
                            });
                        });
                    }).catch(error => {
                        reject({
                            success: false,
                            code: ''
                        });
                    });
                } else {
                    resolve(true);
                }
            } catch (err) {
                reject(err);
            }
        });
    },

    createModuleSearchEngines: function (moduleName, tntCode) {
        return new Promise((resolve, reject) => {
            try {
                let searchConfig = CONFIG.get('search');
                let connectionOptions = SERVICE.DefaultSearchConfigurationService.getSearchConfiguration(moduleName, tntCode);
                if (connectionOptions) {
                    let client = new elasticsearch.Client(connectionOptions);
                    client.ping({
                        requestTimeout: searchConfig.requestTimeout
                    }, function (error) {
                        if (error) {
                            reject({
                                success: false,
                                code: 'ERR_SRCH_00001'
                            });
                        } else {
                            let searchEngine = new CLASSES.SearchEngine();
                            searchEngine.setConnection(client);
                            searchEngine.setOptions(connectionOptions);
                            SERVICE.DefaultSearchConfigurationService.addSearchEngine(moduleName, tntCode, searchEngine);
                            resolve({
                                success: true,
                                code: 'SUC_SRCH_00000'
                            });
                        }
                    });
                } else {
                    this.LOG.warn('Search is not enabled for module: ' + moduleName);
                    resolve({
                        success: true,
                        code: 'SUC_SRCH_00000'
                    });
                }
            } catch (err) {
                this.LOG.error('Facing issue to connect with search cluster');
                this.LOG.error(err);
                reject({
                    success: false,
                    code: 'ERR_SRCH_00000',
                    error: err
                });
            }
        });
    }
};