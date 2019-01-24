/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

*/



module.exports = {

    /**
     * This function is used to setup your service just after service is loaded.
     */
    init: function () {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to setup your service just before routers are getting activated.
     */
    postInit: function () {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    createSearchConnections: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            this.createTenantsSearchEngines(NODICS.getTenants()).then(success => {
                _self.LOG.debug('Search connections has been established successfully');
                resolve(true);
            }).catch(error => {
                _self.LOG.error('Failed establishing connections with search engine');
                reject(error);
            });
        });
    },

    createTenantsSearchEngines: function (tntCodes) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (tntCodes && tntCodes.length > 0) {
                    let tntCode = tntCodes.shift();
                    let modules = SERVICE.DefaultSearchConfigurationService.getSearchActiveModules();
                    _self.createModulesSearchEngines(modules, tntCode).then(success => {
                        _self.createTenantsSearchEngines(tntCodes).then(success => {
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
            } catch (err) {
                reject({
                    success: false,
                    code: 'ERR_SRCH_00000',
                    error: err
                });
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
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    resolve(true);
                }
            } catch (err) {
                reject({
                    success: false,
                    code: 'ERR_SRCH_00000',
                    error: err
                });
            }
        });
    },

    createModuleSearchEngines: function (moduleName, tntCode) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                let searchOptions = SERVICE.DefaultSearchConfigurationService.getSearchConfiguration(moduleName, tntCode);
                if (searchOptions && searchOptions.options.enabled) {
                    if (searchOptions.options.connectionHandler &&
                        SERVICE[searchOptions.options.connectionHandler] &&
                        SERVICE[searchOptions.options.connectionHandler].createSearchConnection &&
                        typeof SERVICE[searchOptions.options.connectionHandler].createSearchConnection === 'function') {
                        searchOptions.moduleName = moduleName;
                        searchOptions.tenant = tntCode;
                        SERVICE[searchOptions.options.connectionHandler].createSearchConnection(searchOptions).then(searchEngine => {
                            searchEngine.getConnection().cat.indices({
                                "format": "json"
                            }, function (err, res) {
                                if (err) {
                                    reject(err);
                                } else {
                                    res.forEach(idx => {
                                        searchEngine.addIndexName(idx.index);
                                    });
                                    SERVICE.DefaultSearchConfigurationService.addTenantSearchEngine(moduleName, tntCode, searchEngine);
                                    resolve(true);
                                }
                            });
                        }).catch(error => {
                            reject(error);
                        });
                    } else {
                        _self.LOG.error('Invalid connection handler configuration for : ' + moduleName + ', tenant: ' + tntCode);
                        reject({
                            success: false,
                            code: 'ERR_SRCH_00000',
                            msg: 'Invalid connection handler configuration for : ' + moduleName + ', tenant: ' + tntCode
                        });
                    }
                } else {
                    _self.LOG.warn('Search is not enabled for module: ' + moduleName);
                    reject(true);
                }
            } catch (err) {
                _self.LOG.error('Facing issue to connect with search cluster');
                _self.LOG.error(err);
                reject({
                    success: false,
                    code: 'ERR_SRCH_00000',
                    error: err
                });
            }
        });
    },
};