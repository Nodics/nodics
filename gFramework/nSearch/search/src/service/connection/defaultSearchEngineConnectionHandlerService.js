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

    createSearchConnections: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            this.createTenantsSearchEngines(NODICS.getActiveTenants()).then(success => {
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
            } catch (error) {
                reject(new CLASSES.NodicsError(error, null, 'ERR_SRCH_00000'));
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
            } catch (error) {
                reject(new CLASSES.NodicsError(error, null, 'ERR_SRCH_00000'));
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
                            SERVICE.DefaultSearchConfigurationService.addTenantSearchEngine(moduleName, tntCode, searchEngine);
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    } else {
                        _self.LOG.error('Invalid connection handler configuration for : ' + moduleName + ', tenant: ' + tntCode);
                        reject(new CLASSES.NodicsError('ERR_SRCH_00000', 'Invalid connection handler configuration for : ' + moduleName + ', tenant: ' + tntCode));
                    }
                } else {
                    _self.LOG.warn('Search is not enabled for module: ' + moduleName);
                    resolve(true);
                }
            } catch (err) {
                _self.LOG.error('Facing issue to connect with search cluster');
                _self.LOG.error(err);
                reject(new CLASSES.NodicsError(error, null, 'ERR_SRCH_00000'));
            }
        });
    },
};