/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    default: {
        defineDefaultDoExists: function (collection, rawSchema) {
            collection.doExists = function (input) {
                return new Promise((resolve, reject) => {
                    try {
                        let searchEngine = input.searchEngine;
                        let indexDef = input.rawSearchSchema;
                        searchEngine.getConnection().exists({
                            index: indexDef.indexName,
                            type: indexDef.typeName,
                            body: input.query.id
                        }, function (error, response, status) {
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

        defineDefaultDoGet: function (collection, rawSchema) {
            collection.doGet = function (input) {
                return new Promise((resolve, reject) => {
                    try {
                        let searchEngine = input.searchEngine;
                        let indexDef = input.rawSearchSchema;
                        searchEngine.getConnection().get({
                            index: indexDef.indexName,
                            type: indexDef.typeName,
                            body: input.query.id
                        }, function (error, response, status) {
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

        defineDefaultDoSearch: function (collection, rawSchema) {
            collection.doSearch = function (input) {
                return new Promise((resolve, reject) => {
                    try {
                        let searchEngine = input.searchEngine;
                        let indexDef = input.rawSearchSchema;
                        searchEngine.getConnection().search({
                            index: indexDef.indexName,
                            type: indexDef.typeName,
                            body: input.query
                        }, function (error, response, status) {
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

        defineDefaultDoSave: function (collection, rawSchema) {
            collection.doSave = function (input) {
                return new Promise((resolve, reject) => {
                    try {
                        try {
                            let searchEngine = input.searchEngine;
                            let indexDef = input.rawSearchSchema;
                            searchEngine.getConnection().index({
                                index: indexDef.indexName,
                                type: indexDef.typeName,
                                id: input.model[indexDef.idPropertyName],
                                body: input.model
                            }, function (error, response, status) {
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

        defineDefaultDoRemove: function (collection, rawSchema) {
            collection.doRemove = function (input) {
                return new Promise((resolve, reject) => {
                    try {
                        let searchEngine = input.searchEngine;
                        let indexDef = input.rawSearchSchema;
                        searchEngine.getConnection().delete({
                            index: indexDef.indexName,
                            type: indexDef.typeName,
                            id: input.query.id,
                            opType: 'create'
                        }, function (error, response, status) {
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

        defineDefaultDoRemoveByQuery: function (collection, rawSchema) {
            collection.doRemoveByQuery = function (input) {
                return new Promise((resolve, reject) => {
                    try {
                        let searchEngine = input.searchEngine;
                        let indexDef = input.rawSearchSchema;
                        searchEngine.getConnection().deleteByQuery({
                            index: indexDef.indexName,
                            type: indexDef.typeName,
                            body: {
                                query: input.query
                            }
                        }, function (error, response, status) {
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

        defineDefaultDoUpdateMapping: function (collection, rawSchema) {
            collection.doUpdateMapping = function (input) {
                return new Promise((resolve, reject) => {
                    try {
                        let searchEngine = input.searchEngine;
                        let indexDef = input.rawSearchSchema;
                        searchEngine.getConnection().indices.putMapping({
                            index: indexDef.indexName,
                            type: indexDef.typeName,
                            body: {
                                query: input.query
                            }
                        }, function (error, response, status) {
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


        /*
        defineDefaultCreateIndex: function (collection, rawSchema) {
            collection.createIndex = function (input) {
                return new Promise((resolve, reject) => {
                    try {
                        let searchEngine = input.searchEngine;
                        let indexDef = input.rawSearchSchema;
                        searchEngine.getConnection().indices.create({
                            index: input.query.indexName
                        }, function (error, response, status) {
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

        defineDefaultRemoveIndex: function (collection, rawSchema) {
            collection.removeIndex = function (input) {
                return new Promise((resolve, reject) => {
                    try {
                        let searchEngine = input.searchEngine;
                        let indexDef = input.rawSearchSchema;
                        searchEngine.getConnection().indices.delete({
                            index: input.query.indexName
                        }, function (error, response, status) {
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

        defineDefaultRemoveType: function (collection, rawSchema) {
            collection.removeType = function (input) {
                return new Promise((resolve, reject) => {
                    try {
                        let searchEngine = input.searchEngine;
                        let indexDef = input.rawSearchSchema;
                        searchEngine.getConnection().indices.delete({
                            type: input.query.typeName
                        }, function (error, response, status) {
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

        defineDefaultHealthCheck: function (collection, rawSchema) {
            collection.checkHealth = function (input) {
                return new Promise((resolve, reject) => {
                    try {
                        let searchEngine = input.searchEngine;
                        let indexDef = input.rawSearchSchema;
                        searchEngine.getConnection().cluster.health({}, function (error, response, status) {
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
        */
    }
};