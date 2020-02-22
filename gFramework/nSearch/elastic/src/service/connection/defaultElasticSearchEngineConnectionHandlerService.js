/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

*/

const _ = require('lodash');
let elasticsearch = require('elasticsearch');

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
            this.loadRawSearchModelDefinition();
            resolve(true);
        });
    },

    loadRawSearchModelDefinition: function () {
        let modelDefinition = {};
        SERVICE.DefaultFilesLoaderService.loadFiles('/src/schemas/elasticSearchModel.js', modelDefinition);
        SERVICE.DefaultSearchConfigurationService.addRawSearchModelDefinition('elastic', modelDefinition);
    },

    createSearchConnection: function (searchOptions) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                let defaultSearchConfig = CONFIG.get('search', searchOptions.tntCode);
                let searchEngine = new CLASSES.SearchEngine();
                searchEngine.setOptions(searchOptions.options);
                searchEngine.setConnectionOptions(searchOptions.connection);
                let client = new elasticsearch.Client(searchOptions.connection);
                client.ping({
                    requestTimeout: defaultSearchConfig.requestTimeout
                }, function (error) {
                    if (error) {
                        reject(new CLASSES.NodicsError(error, null, 'ERR_SRCH_00001'));
                    } else {
                        searchEngine.setConnection(client);
                        searchEngine.setActive(true);
                        _self.getIndexes(searchEngine).then(success => {
                            searchEngine.setIndexes(success);
                            resolve(searchEngine);
                        }).catch(error => {
                            reject(error);
                        });
                    }
                });
            } catch (err) {
                reject(new CLASSES.NodicsError(err, null, 'ERR_SRCH_00000'));
            }
        });
    },

    getIndexes: function (searchEngine, indexName) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                _self.LOG.debug('Retrieving list of available indexes for');
                searchEngine.getConnection().cluster.state({}, function (error, response) {
                    if (error) {
                        reject(new CLASSES.NodicsError(error, null, 'ERR_SRCH_00000'));
                    } else {
                        resolve(response.metadata.indices || {});
                    }
                });
            } catch (error) {
                reject(new CLASSES.NodicsError(error, null, 'ERR_SRCH_00000'));
            }
        });
    },
};