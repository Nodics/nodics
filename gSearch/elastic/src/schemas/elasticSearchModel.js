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
        defineDefaultDoExists: function (searchModel) {
            searchModel.doExists = function (input) {
                let _self = this;
                return new Promise((resolve, reject) => {
                    try {
                        _self.searchEngine.getConnection().exists({
                            index: _self.indexDef.indexName,
                            type: _self.indexDef.typeName,
                            body: input.query.id
                        }, function (error, response) {
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
                        _self.searchEngine.getConnection().cluster.health({}, function (error, response) {
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

        defineDefaultDoIndex: function (searchModel) {
            searchModel.doIndex = function (input) {
                let _self = this;
                return new Promise((resolve, reject) => {
                    try {
                        _self.searchEngine.getConnection().cluster.health({}, function (error, response) {
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

        defineDefaultDoGet: function (searchModel) {
            searchModel.doGet = function (input) {
                let _self = this;
                return new Promise((resolve, reject) => {
                    try {
                        _self.searchEngine.getConnection().get({
                            index: _self.indexDef.indexName,
                            type: _self.indexDef.typeName,
                            body: input.query.id
                        }, function (error, response) {
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

        defineDefaultDoSearch: function (searchModel) {
            searchModel.doSearch = function (input) {
                let _self = this;
                return new Promise((resolve, reject) => {
                    try {
                        _self.searchEngine.getConnection().search({
                            index: _self.indexDef.indexName,
                            type: _self.indexDef.typeName,
                            body: input.query
                        }, function (error, response) {
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
                            _self.searchEngine.getConnection().index({
                                index: _self.indexDef.indexName,
                                type: _self.indexDef.typeName,
                                id: input.model[_self.indexDef.idPropertyName],
                                body: input.model
                            }, function (error, response) {
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

        defineDefaultDoRefresh: function (searchModel) {
            searchModel.doRefresh = function (input) {
                let _self = this;
                return new Promise((resolve, reject) => {
                    try {
                        try {
                            let indexDetail = _.merge(_self.searchEngine.getOptions().refreshOptions || {}, {
                                index: _self.indexDef.indexName,
                                body: input.refreshOptions || {}
                            });
                            _self.LOG.debug('Executing refresh command with options: ');
                            _self.LOG.debug(indexDetail);
                            _self.searchEngine.getConnection().indices.refresh(indexDetail, function (error, response) {
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

        defineDefaultDoRemove: function (searchModel) {
            searchModel.doRemove = function (input) {
                let _self = this;
                return new Promise((resolve, reject) => {
                    try {
                        _self.searchEngine.getConnection().delete({
                            index: _self.indexDef.indexName,
                            type: _self.indexDef.typeName,
                            id: input.query.id
                        }, function (error, response) {
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

        defineDefaultDoRemoveByQuery: function (searchModel) {
            searchModel.doRemoveByQuery = function (input) {
                let _self = this;
                return new Promise((resolve, reject) => {
                    try {
                        _self.searchEngine.getConnection().deleteByQuery({
                            index: _self.indexDef.indexName,
                            type: _self.indexDef.typeName,
                            body: {
                                query: input.query
                            }
                        }, function (error, response) {
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

        defineDefaultGetMapping: function (searchModel) {
            searchModel.getMapping = function (input) {
                let _self = this;
                return new Promise((resolve, reject) => {
                    try {
                        _self.searchEngine.getConnection().indices.getMapping({
                            index: _self.indexDef.indexName,
                            type: _self.indexDef.typeName,
                        }, function (error, response) {
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

        defineDefaultUpdateMapping: function (searchModel) {
            searchModel.updateMapping = function (input) {
                let _self = this;
                return new Promise((resolve, reject) => {
                    try {
                        _self.searchEngine.getConnection().indices.putMapping({
                            index: _self.indexDef.indexName,
                            type: _self.indexDef.typeName,
                            body: input.searchSchema
                        }, function (error, response) {
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
            searchModel.removeType = function (input) {
                let _self = this;
                return new Promise((resolve, reject) => {
                    try {
                        _self.searchEngine.getConnection().indices.delete({
                            type: _self.indexDef.typeName,
                        }, function (error, response) {
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