/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const _ = require('lodash');
let elasticsearch = require('@elastic/elasticsearch');

/**
 * @module gFramework/nSearch/elastic/src/service/connection/defaultElasticSearchEngineConnectionHandlerService
 * @description Implements nSearch default elastic search engine connection handler service business behavior and extension logic.
 * @layer service
 * @owner nSearch
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    /**
     * Converts the Nodics search connection contract into the option names
     * accepted by the current Elasticsearch client. The framework continues to
     * accept the historic `hosts` property so layered project configuration is
     * not broken during client upgrades.
     * @param {Object} connection Nodics search connection configuration.
     * @param {number} requestTimeout Request timeout in milliseconds.
     * @returns {Object} Elasticsearch client options.
     */
    getClientOptions: function (connection, requestTimeout) {
        let clientOptions = Object.assign({}, connection || {});
        if (!clientOptions.node && !clientOptions.nodes && clientOptions.hosts) {
            clientOptions.nodes = clientOptions.hosts;
        }
        if (requestTimeout !== undefined && clientOptions.requestTimeout === undefined) {
            clientOptions.requestTimeout = requestTimeout;
        }
        delete clientOptions.hosts;
        delete clientOptions.log;
        delete clientOptions.deadTimeout;
        return clientOptions;
    },

    /**
     * Invokes an Elasticsearch client method using its promise contract while
     * retaining compatibility with callback-based project test adapters.
     * @param {Object} target Elasticsearch client or namespace.
     * @param {string} method Method name.
     * @param {Object} parameters Request parameters.
     * @returns {Promise<*>} Provider response.
     */
    invoke: function (target, method, parameters) {
        if (target[method].constructor.name === 'AsyncFunction') {
            try {
                return Promise.resolve(target[method](parameters));
            } catch (error) {
                return Promise.reject(error);
            }
        }
        return new Promise((resolve, reject) => {
            target[method](parameters, (error, response) => {
                if (error) reject(error);
                else resolve(response);
            });
        });
    },

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

    /**

     * Retrieves raw search model definition information.

     *

     * @returns {*} Method result.

     */

    loadRawSearchModelDefinition: function () {
        let modelDefinition = {};
        SERVICE.DefaultFilesLoaderService.loadFiles('/src/schemas/elasticSearchModel.js', modelDefinition);
        SERVICE.DefaultSearchConfigurationService.addRawSearchModelDefinition('elastic', modelDefinition);
    },

    /**

     * Updates search connection information.

     *

     * @param {*} searchOptions Method input.

     * @returns {*} Method result.

     */

    createSearchConnection: function (searchOptions) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                let defaultSearchConfig = CONFIG.get('search', searchOptions.tntCode);
                let searchEngine = new CLASSES.SearchEngine();
                searchEngine.setOptions(searchOptions.options);
                searchEngine.setConnectionOptions(searchOptions.connection);
                let client = new elasticsearch.Client(this.getClientOptions(
                    searchOptions.connection,
                    defaultSearchConfig.requestTimeout
                ));
                this.invoke(client, 'ping', {}).then(() => {
                    searchEngine.setConnection(client);
                    searchEngine.setActive(true);
                    return _self.getIndexes(searchEngine);
                }).then(indexes => {
                    searchEngine.setIndexes(indexes);
                    resolve(searchEngine);
                }).catch(error => {
                    reject(new CLASSES.SearchError(error, null, 'ERR_SRCH_00009'));
                });
            } catch (err) {
                reject(new CLASSES.SearchError(err, null, 'ERR_SRCH_00000'));
            }
        });
    },

    /**

     * Retrieves indexes information.

     *

     * @param {*} searchEngine Method input.

     * @param {*} indexName Method input.

     * @returns {*} Method result.

     */

    getIndexes: function (searchEngine, indexName) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                _self.LOG.debug('Retrieving list of available indexes for');
                this.invoke(searchEngine.getConnection().cluster, 'state', {}).then(response => {
                    resolve(response.metadata && response.metadata.indices || {});
                }).catch(error => {
                    reject(new CLASSES.SearchError(error,
                        'While retrieving cluster state information', 'ERR_SRCH_00000'));
                });
            } catch (error) {
                reject(new CLASSES.SearchError(error, null, 'ERR_SRCH_00000'));
            }
        });
    },
};
