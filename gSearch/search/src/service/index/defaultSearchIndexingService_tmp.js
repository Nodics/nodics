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

    getSearchOptions: function (moduleName, tntCode, indexType) {
        let searchEngine = NODICS.getTenantSearchEngine(moduleName, tntCode);
        if (searchEngine) {
            let indexDef = NODICS.getTenantRawSearchSchema(moduleName, tntCode, indexType);
            if (indexDef && indexDef.enabled) {
                return {
                    searchEngine: searchEngine,
                    options: searchEngine.getOptions(),
                    indexDef: indexDef,
                    moduleName: moduleName,
                    tntCode: tntCode,
                    indexType: indexType
                };
            } else {
                throw new Error('Search schema not available or is disabled for module: ' + moduleName + ', tenant: ' + tntCode + ', index type: ' + indexTypeName);
            }
        } else {
            throw new Error('Search engine not available for module: ' + moduleName + ' and tenant: ' + tntCode);
        }
    },

    fullIndex: function (request) {
        return new Promise((resolve, reject) => {
            let moduleName = request.moduleName;
            let tntCode = request.tenant;
            let indexName = request.indexName;
            let indexType = request.indexType;
            try {
                let searchOptions = this.getSearchOptions(moduleName, tntCode, indexType);
                searchOptions.indexName = indexName;
                searchOptions.operationType = 'full';
                this.pushData().then(success => {
                    resolve({
                        success: true,
                        code: ''
                    });
                }).catch(error => {
                    reject({
                        success: false,
                        code: '',
                        error: error
                    });
                });
            } catch (error) {
                reject({
                    success: false,
                    code: '',
                    error: error
                });
            }
        });
    },

    incrementalIndex: function (request) {
        return new Promise((resolve, reject) => {
            let moduleName = request.moduleName;
            let tntCode = request.tenant;
            let indexName = request.indexName;
            let indexType = request.indexType;
            try {
                let searchOptions = this.getSearchOptions(moduleName, tntCode, indexType);
                searchOptions.indexName = indexName;
                searchOptions.operationType = 'incremental';
                this.pushData().then(success => {
                    resolve({
                        success: true,
                        code: ''
                    });
                }).catch(error => {
                    reject({
                        success: false,
                        code: '',
                        error: error
                    });
                });
            } catch (error) {
                reject({
                    success: false,
                    code: '',
                    error: error
                });
            }
        });
    },

    buildFullSearchQuery: function (searchOptions) {
        return new Promise((resolve, reject) => {
            let defaultQuery = searchOptions.options.fullIndexDataQuery;
            resolve(defaultQuery);
        });
    },

    buildIncrementalSearchQuery: function (searchOptions) {
        return new Promise((resolve, reject) => {
            let defaultQuery = searchOptions.options.fullIndexDataQuery;
            resolve(defaultQuery);
        });
    },

    buildSearchQuery: function (searchOptions) {
        return new Promise((resolve, reject) => {
            if (searchOptions.operationType === 'full') {
                return this.buildFullSearchQuery(searchOptions);
            } else {
                return this.buildIncrementalSearchQuery(searchOptions);
            }
        });
    },

    fetchData: function (searchOptions) {
        return new Promise((resolve, reject) => {
            this.buildSearchQuery().then(success => {
                searchOptions.indexQuery = success;
                console.log(searchOptions);
                searchOptions.serviceName = '';
                SERVICE[searchOptions.serviceName].get({
                    tenant: searchOptions.tntCode,
                    query: query,
                    options: searchOptions.queryOptions
                }).then(response => {
                    resolve(response.result || []);
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    },

    pushData: function (searchOptions) {
        return new Promise((resolve, reject) => {
            this.fetchData(searchOptions).then(models => {
                console.log(models);
                if (models && models.length > 0) {
                    SERVICE[searchOptions.serviceName].doSave({
                        tenant: searchOptions.tntCode,
                        models: models
                    }).then(response => {
                        resolve(response.result || []);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    resolve(true);
                }
            }).catch(error => {
                reject(error);
            });
        });
    }
};