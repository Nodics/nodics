/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

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
                        _self.searchEngine.getConnection().indices.create(indexQuery, function (error, response) {
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
                        _self.searchEngine.getConnection().indices.refresh(refreshQuery, function (error, response) {
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
                        _self.searchEngine.getConnection().cluster.health(healthCheckQuery, function (error, response) {
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

        defineDefaultDoSearch: function (searchModel) { //Required pipeline to process this request
            searchModel.doSearch = function (input) {
                let _self = this;
                return new Promise((resolve, reject) => {
                    try {
                        let searchQuery = _.merge({}, _self.searchEngine.getOptions().searchOptions || {});
                        searchQuery = _.merge(searchQuery, input.options || {});
                        searchQuery = _.merge(searchQuery, {
                            index: _self.indexDef.indexName.toLowerCase(),
                            type: _self.indexDef.typeName.toLowerCase()
                        });
                        if (input.q) {
                            searchQuery.q = input.q;
                        } else {
                            searchQuery.body = {
                                query: input.query || {}
                            };
                        }
                        _self.LOG.debug('Executing search command with options');
                        _self.LOG.debug(searchQuery);
                        _self.searchEngine.getConnection().search(searchQuery, function (error, response) {
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

        defineDefaultDoSave: function (searchModel) {
            searchModel.doSave = function (input) {
                let _self = this;
                return new Promise((resolve, reject) => {
                    try {
                        let putQuery = _.merge({}, _self.searchEngine.getOptions().saveOptions || {});
                        putQuery = _.merge(putQuery, input.options || {});
                        putQuery = _.merge(putQuery, {
                            index: _self.indexDef.indexName.toLowerCase(),
                            type: _self.indexDef.typeName.toLowerCase(),
                            body: input.model
                        });
                        if (input.model[_self.indexDef.idPropertyName]) {
                            putQuery.id = input.model[_self.indexDef.idPropertyName];
                        }
                        _self.LOG.debug('Executing save command with options');
                        _self.LOG.debug(putQuery);
                        _self.searchEngine.getConnection().index(putQuery, function (error, response) {
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

        defineDefaultGetSchema: function (searchModel) {  //Required pipeline to process this request
            searchModel.doGetSchema = function (input) {
                let _self = this;
                return new Promise((resolve, reject) => {
                    try {
                        let schemaQuery = _.merge({}, _self.searchEngine.getOptions().schemaGetOptions || {});
                        schemaQuery = _.merge(schemaQuery, input.options || {});
                        schemaQuery = _.merge(schemaQuery, {
                            index: _self.indexDef.indexName.toLowerCase(),
                            type: _self.indexDef.typeName.toLowerCase()
                        });
                        _self.searchEngine.getConnection().indices.getMapping(schemaQuery, function (error, response) {
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

        defineDefaultUpdateSchema: function (searchModel) { //Required pipeline to process this request
            searchModel.doUpdateSchema = function (input) {
                let _self = this;
                return new Promise((resolve, reject) => {
                    try {
                        let schemaQuery = _.merge({}, _self.searchEngine.getOptions().schemaGetOptions || {});
                        schemaQuery = _.merge(schemaQuery, input.options || {});
                        schemaQuery = _.merge(schemaQuery, {
                            index: _self.indexDef.indexName.toLowerCase(),
                            type: _self.indexDef.typeName.toLowerCase(),
                            body: input.searchSchema
                        });
                        _self.searchEngine.getConnection().indices.putMapping(schemaQuery, function (error, response) {
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