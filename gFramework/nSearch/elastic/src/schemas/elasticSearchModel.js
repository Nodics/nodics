/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const _ = require('lodash');

function invokeClient(target, method, parameters) {
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
}

/**
 * @module gFramework/nSearch/elastic/src/schemas/elasticSearchModel
 * @description Defines nSearch schema metadata, model contracts, and generated capability settings.
 * @layer schemas
 * @owner nSearch
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    /*
        Default object which available in this class
        - moduleName: moduleName,
        - tntCode: tntCode,
        - searchEngine: searchEngine,
        - typeName: typeName,
        - indexDef: indexDef
    */
    default: {

        /**

         * Executes define default do create index behavior.

         *

         * @param {*} searchModel Method input.

         * @returns {*} Method result.

         */

        defineDefaultDoCreateIndex: function (searchModel) { //Required pipeline to process this request
            searchModel.doCreateIndex = function (input) {
                let _self = this;
                return new Promise((resolve, reject) => {
                    try {
                        let indexQuery = _.merge({}, _self.searchEngine.getOptions().createIndexOptions || {});
                        indexQuery = _.merge(indexQuery, input.options || {});
                        indexQuery = _.merge(indexQuery, {
                            index: _self.indexDef.indexName.toLowerCase()
                        });
                        _self.LOG.debug('Creating index for indexName: ' + _self.indexDef.indexName.toLowerCase());
                        invokeClient(_self.searchEngine.getConnection().indices, 'create', indexQuery)
                            .then(resolve).catch(reject);
                    } catch (error) {
                        reject(error);
                    }
                });
            };
        },

        /**

         * Executes define default do refresh behavior.

         *

         * @param {*} searchModel Method input.

         * @returns {*} Method result.

         */

        defineDefaultDoRefresh: function (searchModel) { //Required pipeline to process this request
            searchModel.doRefresh = function (input) {
                let _self = this;
                return new Promise((resolve, reject) => {
                    try {
                        let refreshQuery = _.merge({}, _self.searchEngine.getOptions().refreshOptions || {});
                        refreshQuery = _.merge(refreshQuery, input.options || {});
                        refreshQuery = _.merge(refreshQuery, {
                            index: _self.indexDef.indexName.toLowerCase()
                        });
                        _self.LOG.debug('Executing refresh command with options:');
                        _self.LOG.debug(refreshQuery);
                        invokeClient(_self.searchEngine.getConnection().indices, 'refresh', refreshQuery)
                            .then(resolve).catch(reject);
                    } catch (error) {
                        reject(error);
                    }
                });
            };
        },

        /**

         * Executes define default do check health behavior.

         *

         * @param {*} searchModel Method input.

         * @returns {*} Method result.

         */

        defineDefaultDoCheckHealth: function (searchModel) {
            searchModel.doCheckHealth = function (input) {
                let _self = this;
                return new Promise((resolve, reject) => {
                    try {
                        let healthCheckQuery = _.merge({}, _self.searchEngine.getOptions().healthOptions || {});
                        healthCheckQuery = _.merge(healthCheckQuery, input.options || {});
                        healthCheckQuery = _.merge(healthCheckQuery, {
                            index: _self.indexDef.indexName.toLowerCase()
                        });
                        _self.LOG.debug('Executing health command with options');
                        _self.LOG.debug(healthCheckQuery);
                        invokeClient(_self.searchEngine.getConnection().cluster, 'health', healthCheckQuery)
                            .then(resolve).catch(reject);
                    } catch (error) {
                        reject(error);
                    }
                });
            };
        },

        /**

         * Executes define default do exists behavior.

         *

         * @param {*} searchModel Method input.

         * @returns {*} Method result.

         */

        defineDefaultDoExists: function (searchModel) {
            searchModel.doExists = function (input) {
                let _self = this;
                return new Promise((resolve, reject) => {
                    try {
                        let existQuery = _.merge({}, _self.searchEngine.getOptions().existsOptions || {});
                        existQuery = _.merge(existQuery, input.options || {});
                        existQuery = _.merge(existQuery, {
                            index: _self.indexDef.indexName.toLowerCase(),
                            type: _self.indexDef.typeName.toLowerCase(),
                            id: input.query.id
                        });
                        _self.LOG.debug('Executing health command with options');
                        _self.LOG.debug(existQuery);
                        _self.searchEngine.getConnection().exists(existQuery, function (error, response) {
                            if (error) {
                                reject(error);
                            }
                            else {
                                resolve({
                                    available: response
                                });
                            }
                        });
                    } catch (error) {
                        reject(error);
                    }
                });
            };
        },
        /**
         * Executes define default do get behavior.
         *
         * @param {*} searchModel Method input.
         * @returns {*} Method result.
         */
        defineDefaultDoGet: function (searchModel) {
            searchModel.doGet = function (input) { //Required pipeline to process this request
                let _self = this;
                return new Promise((resolve, reject) => {
                    try {
                        let getQuery = _.merge({}, _self.searchEngine.getOptions().getOptions || {});
                        getQuery = _.merge(getQuery, input.options || {});
                        getQuery = _.merge(getQuery, {
                            index: _self.indexDef.indexName.toLowerCase(),
                            type: _self.indexDef.typeName.toLowerCase(),
                            id: input.query.id
                        });
                        _self.LOG.debug('Executing get command with options');
                        _self.LOG.debug(getQuery);
                        _self.searchEngine.getConnection().get(getQuery, function (error, response) {
                            if (error) {
                                reject(error);
                            }
                            else {
                                resolve(response);
                            }
                        });
                    } catch (error) {
                        reject(error);
                    }
                });
            };
        },

        /**

         * Executes define default do search behavior.

         *

         * @param {*} searchModel Method input.

         * @returns {*} Method result.

         */

        defineDefaultDoSearch: function (searchModel) { //Required pipeline to process this request
            searchModel.doSearch = function (input) {
                let _self = this;
                return new Promise((resolve, reject) => {
                    try {
                        let searchQuery = _.merge({}, _self.searchEngine.getOptions().searchOptions || {});
                        searchQuery = _.merge(searchQuery, input.options || {});
                        searchQuery = _.merge(searchQuery, {
                            index: _self.indexDef.indexName.toLowerCase()
                        });
                        if (input.normalizedSearchRequest) {
                            const normalized = input.normalizedSearchRequest;
                            const filters = Object.keys(normalized.filters).map(name => {
                                const value = normalized.filters[name];
                                return Array.isArray(value) ?
                                    { terms: { [name]: value } } :
                                    { term: { [name]: value } };
                            });
                            const lexicalQuery = {
                                bool: {
                                    must: [{
                                        multi_match: {
                                            query: normalized.text,
                                            fields: normalized.fields
                                        }
                                    }],
                                    filter: filters
                                }
                            };
                            searchQuery.size = normalized.size;
                            if (normalized.minimumScore !== undefined) {
                                searchQuery.min_score = normalized.minimumScore;
                            }
                            if (normalized.mode === 'LEXICAL' || normalized.mode === 'HYBRID') {
                                searchQuery.query = lexicalQuery;
                            }
                            if (normalized.mode === 'VECTOR' || normalized.mode === 'HYBRID') {
                                searchQuery.knn = {
                                    field: normalized.vectorField,
                                    query_vector: normalized.vector,
                                    k: normalized.size,
                                    num_candidates: Math.max(normalized.size * 10, 100),
                                    filter: filters
                                };
                            }
                        } else if (input.q) {
                            searchQuery.type = _self.indexDef.typeName.toLowerCase();
                            searchQuery.q = input.q;
                        } else {
                            searchQuery.type = _self.indexDef.typeName.toLowerCase();
                            searchQuery.body = {
                                query: input.query || {}
                            };
                        }
                        _self.LOG.debug('Executing search command with options');
                        _self.LOG.debug(searchQuery);
                        invokeClient(_self.searchEngine.getConnection(), 'search', searchQuery)
                            .then(resolve).catch(reject);
                    } catch (error) {
                        reject(error);
                    }
                });
            };
        },

        /**

         * Executes define default do save behavior.

         *

         * @param {*} searchModel Method input.

         * @returns {*} Method result.

         */

        defineDefaultDoSave: function (searchModel) {
            searchModel.doSave = function (input) {
                let _self = this;
                return new Promise((resolve, reject) => {
                    try {
                        let putQuery = _.merge({}, _self.searchEngine.getOptions().saveOptions || {});
                        putQuery = _.merge(putQuery, input.options || {});
                        putQuery = _.merge(putQuery, {
                            index: _self.indexDef.indexName.toLowerCase(),
                            document: input.model
                        });
                        if (input.model[_self.indexDef.idPropertyName]) {
                            putQuery.id = input.model[_self.indexDef.idPropertyName];
                        }
                        _self.LOG.debug('Executing save command with options');
                        _self.LOG.debug(putQuery);
                        invokeClient(_self.searchEngine.getConnection(), 'index', putQuery)
                            .then(resolve).catch(reject);
                    } catch (error) {
                        reject(error);
                    }
                });
            };
        },

        /**

         * Executes define default do bulk behavior.

         *

         * @param {*} searchModel Method input.

         * @returns {*} Method result.

         */

        defineDefaultDoBulk: function (searchModel) { //Required pipeline to process this request
            searchModel.doBulk = function (input) {
                let _self = this;
                return new Promise((resolve, reject) => {
                    try {
                        let bulkQuery = _.merge(_self.searchEngine.getOptions().bulkOptions || {}, _.merge(input.options || {}, {
                            body: input.models
                        }));
                        _self.LOG.debug('Executing bulk command with options');
                        _self.LOG.debug(bulkQuery);
                        _self.searchEngine.getConnection().bulk(bulkQuery, function (error, response) {
                            if (error) {
                                reject(error);
                            }
                            else {
                                resolve(response);
                            }
                        });
                    } catch (error) {
                        reject(error);
                    }
                });
            };
        },

        /**

         * Executes define default do update behavior.

         *

         * @param {*} searchModel Method input.

         * @returns {*} Method result.

         */

        defineDefaultDoUpdate: function (searchModel) {
            searchModel.doUpdate = function (input) {
                let _self = this;
                return new Promise((resolve, reject) => {
                    try {
                        let updateQuery = _.merge(_self.searchEngine.getOptions().updateOptions || {}, _.merge(input.options || {}, {
                            body: input.data
                        }));
                        _self.LOG.debug('Executing update with options');
                        _self.LOG.debug(updateQuery);
                        _self.searchEngine.getConnection().update(updateQuery, function (error, response) {
                            if (error) {
                                reject(error);
                            }
                            else {
                                resolve(response);
                            }
                        });
                    } catch (error) {
                        reject(error);
                    }
                });
            };
        },

        /**

         * Executes define default do remove behavior.

         *

         * @param {*} searchModel Method input.

         * @returns {*} Method result.

         */

        defineDefaultDoRemove: function (searchModel) { //Required pipeline to process this request
            searchModel.doRemove = function (input) {
                let _self = this;
                return new Promise((resolve, reject) => {
                    try {
                        let removeQuery = _.merge({}, _self.searchEngine.getOptions().removeOptions || {});
                        removeQuery = _.merge(removeQuery, input.options || {});
                        removeQuery = _.merge(removeQuery, {
                            index: _self.indexDef.indexName.toLowerCase(),
                            type: _self.indexDef.typeName.toLowerCase(),
                            id: input.query.id
                        });
                        _self.LOG.debug('Executing remove command with options');
                        _self.LOG.debug(removeQuery);
                        _self.searchEngine.getConnection().delete(removeQuery, function (error, response) {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(response);
                            }
                        });
                    } catch (error) {
                        reject(error);
                    }
                });
            };
        },

        /**

         * Executes define default do remove by query behavior.

         *

         * @param {*} searchModel Method input.

         * @returns {*} Method result.

         */

        defineDefaultDoRemoveByQuery: function (searchModel) { //Required pipeline to process this request
            searchModel.doRemoveByQuery = function (input) {
                let _self = this;
                return new Promise((resolve, reject) => {
                    try {
                        let removeQuery = _.merge({}, _self.searchEngine.getOptions().removeOptions || {});
                        removeQuery = _.merge(removeQuery, input.options || {});
                        removeQuery = _.merge(removeQuery, {
                            index: _self.indexDef.indexName.toLowerCase(),
                            type: _self.indexDef.typeName.toLowerCase(),
                            body: {
                                query: input.query
                            }
                        });
                        _self.LOG.debug('Executing remove command with options');
                        _self.LOG.debug(removeQuery);
                        _self.searchEngine.getConnection().deleteByQuery(removeQuery, function (error, response) {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(response);
                            }
                        });
                    } catch (error) {
                        reject(error);
                    }
                });
            };
        },

        /**

         * Executes define default get schema behavior.

         *

         * @param {*} searchModel Method input.

         * @returns {*} Method result.

         */

        defineDefaultGetSchema: function (searchModel) {  //Required pipeline to process this request
            searchModel.doGetSchema = function (input) {
                let _self = this;
                return new Promise((resolve, reject) => {
                    try {
                        let schemaQuery = _.merge({}, _self.searchEngine.getOptions().schemaGetOptions || {});
                        schemaQuery = _.merge(schemaQuery, input.options || {});
                        schemaQuery = _.merge(schemaQuery, {
                            index: _self.indexDef.indexName.toLowerCase()
                        });
                        invokeClient(_self.searchEngine.getConnection().indices, 'getMapping', schemaQuery)
                            .then(resolve).catch(reject);
                    } catch (error) {
                        reject(error);
                    }
                });
            };
        },

        /**

         * Executes define default update schema behavior.

         *

         * @param {*} searchModel Method input.

         * @returns {*} Method result.

         */

        defineDefaultUpdateSchema: function (searchModel) { //Required pipeline to process this request
            searchModel.doUpdateSchema = function (input) {
                let _self = this;
                return new Promise((resolve, reject) => {
                    try {
                        let schemaQuery = _.merge({}, _self.searchEngine.getOptions().schemaPutOptions || {});
                        schemaQuery = _.merge(schemaQuery, input.options || {});
                        schemaQuery = _.merge(schemaQuery, {
                            index: _self.indexDef.indexName.toLowerCase(),
                            properties: input.searchSchema.properties
                        });
                        invokeClient(_self.searchEngine.getConnection().indices, 'putMapping', schemaQuery)
                            .then(resolve).catch(reject);
                    } catch (error) {
                        reject(error);
                    }
                });
            };
        },

        /**

         * Executes define default remove index behavior.

         *

         * @param {*} searchModel Method input.

         * @returns {*} Method result.

         */

        defineDefaultRemoveIndex: function (searchModel) {
            searchModel.doRemoveIndex = function (input) {
                let _self = this;
                return new Promise((resolve, reject) => {
                    try {
                        let deleteQuery = _.merge({}, _self.searchEngine.getOptions().removeIndexOptions || {});
                        deleteQuery = _.merge(deleteQuery, input.options || {});
                        deleteQuery = _.merge(deleteQuery, {
                            index: _self.indexDef.indexName.toLowerCase()
                        });
                        _self.searchEngine.getConnection().indices.delete(deleteQuery, function (error, response) {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(response);
                            }
                        });
                    } catch (error) {
                        reject(error);
                    }
                });
            };
        }
    }
};
