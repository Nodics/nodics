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

        defineDefaultDoRefresh: function (searchModel) { //Required pipeline to process this request
            searchModel.doRefresh = function (input) {
                let _self = this;
                return new Promise((resolve, reject) => {
                    try {
                        try {
                            let refreshQuery = _.merge(_.merge({}, _self.searchEngine.getOptions().refreshOptions || {}), {
                                index: _self.indexDef.indexName,
                                body: input.refreshOptions || {}
                            });
                            _self.LOG.debug('Executing refresh command with options: ');
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
                        //Get configured options, merge input options on top of that
                        let indexQuery = _.merge(_self.searchEngine.getOptions().healthOptions || {}, _.merge(input.options || {}, {
                            index: _self.indexDef.indexName
                        }));
                        _self.LOG.debug('Executing health command with options');
                        _self.LOG.debug(indexQuery);
                        _self.searchEngine.getConnection().cluster.health(indexQuery, function (error, response) {
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
                        let indexQuery = _.merge(_.merge({}, _self.searchEngine.getOptions().existsOptions || {}), _.merge(_.merge({}, input.options || {}), {
                            index: _self.indexDef.indexName,
                            type: _self.indexDef.typeName,
                            id: input.query.id
                        }));
                        _self.LOG.debug('Executing health command with options');
                        _self.LOG.debug(indexQuery);
                        _self.searchEngine.getConnection().exists(indexQuery, function (error, response) {
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
                        let searchQuery = _.merge(_.merge({}, _self.searchEngine.getOptions().getOptions || {}),
                            _.merge(_.merge({}, input.query || {}), {
                                index: _self.indexDef.indexName,
                                type: _self.indexDef.typeName,
                                id: input.query.id
                            })
                        );
                        _self.LOG.debug('Executing get command with options');
                        _self.LOG.debug(searchQuery);
                        _self.searchEngine.getConnection().get(searchQuery, function (error, response) {
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
                        let searchQuery = _.merge(_.merge({}, _self.searchEngine.getOptions().searchOptions || {}),
                            _.merge(_.merge({}, input.options || {}), {
                                index: _self.indexDef.indexName,
                                type: _self.indexDef.typeName
                            })
                        );
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
                        try {
                            let putQuery = _.merge(_.merge({}, _self.searchEngine.getOptions().saveOptions || {}), _.merge(_.merge({}, input.options || {}), {
                                index: _self.indexDef.indexName,
                                type: _self.indexDef.typeName,
                                id: input.model[_self.indexDef.idPropertyName],
                                body: input.model
                            }));
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
                        let removeQuery = _.merge(_self.searchEngine.getOptions().removeOptions || {},
                            _.merge(input.options || {}, {
                                index: _self.indexDef.indexName,
                                type: _self.indexDef.typeName,
                                id: input.query.id
                            })
                        );
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
                        let removeQuery = _.merge(_self.searchEngine.getOptions().removeOptions || {},
                            _.merge(input.options || {}, {
                                index: _self.indexDef.indexName,
                                type: _self.indexDef.typeName,
                                body: {
                                    query: input.query
                                }
                            })
                        );
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

        defineDefaultGetMapping: function (searchModel) {  //Required pipeline to process this request
            searchModel.doGetMapping = function (input) {
                let _self = this;
                return new Promise((resolve, reject) => {
                    try {
                        let mappingQuery = _.merge(_self.searchEngine.getOptions().mappingGetOptions || {},
                            _.merge(input.options || {}, {
                                index: _self.indexDef.indexName,
                                type: _self.indexDef.typeName,
                            })
                        );
                        _self.searchEngine.getConnection().indices.getMapping(mappingQuery, function (error, response) {
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

        defineDefaultUpdateMapping: function (searchModel) { //Required pipeline to process this request
            searchModel.doUpdateMapping = function (input) {
                let _self = this;
                return new Promise((resolve, reject) => {
                    try {
                        let mappingQuery = _.merge(_self.searchEngine.getOptions().mappingPutOptions || {},
                            _.merge(input.options || {}, {
                                index: _self.indexDef.indexName,
                                type: _self.indexDef.typeName,
                                body: input.searchSchema
                            })
                        );
                        _self.searchEngine.getConnection().indices.putMapping(mappingQuery, function (error, response) {
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

        defineDefaultRemoveType: function (searchModel) {
            searchModel.doRemoveIndex = function (input) {
                let _self = this;
                return new Promise((resolve, reject) => {
                    try {
                        let deleteQuery = _.merge(_self.searchEngine.getOptions().removeTypeOptions || {},
                            _.merge(input.options || {}, {
                                index: _self.indexDef.indexName
                            })
                        );
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