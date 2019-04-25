/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

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

    /**
     * This function is used to check if search cluster is live and running fine
     * @param {request} request is used to carry request parameters sent by consumer
     * @param {callback} callback is a function, called after fullfilling business requirement 
     */
    doRefresh: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (request.httpRequest.params.id) {
            request.query = request.query || {};
            request.query.id = request.httpRequest.params.id;
        }
        if (callback) {
            FACADE.dsdName.doRefresh(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.doRefresh(request);
        }
    },

    /**
     * This function is used to check if search cluster is live and running fine
     * @param {request} request is used to carry request parameters sent by consumer
     * @param {callback} callback is a function, called after fullfilling business requirement 
     */
    doCheckHealth: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.dsdName.doCheckHealth(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.doCheckHealth(request);
        }
    },

    /**
    * This function is used to check if requested document is available withing current index and its type
    * @param {request} request is used to carry request parameters sent by consumer
    * @param {callback} callback is a function, called after fullfilling business requirement 
    */
    doExists: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (request.httpRequest.params.id) {
            request.query = request.query || {};
            request.query.id = request.httpRequest.params.id;
        }
        if (callback) {
            FACADE.dsdName.doExists(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.doExists(request);
        }
    },

    /**
    * This function is used to fetch a single document from index
    * @param {request} request is used to carry request parameters sent by consumer
    * @param {callback} callback is a function, called after fullfilling business requirement 
    */
    doGet: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        if (request.httpRequest.params.id) {
            request.query = {
                id: request.httpRequest.params.id
            };
        } else {
            request = _.merge(request, request.httpRequest.body || {});
        }
        if (callback) {
            FACADE.dsdName.doGet(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.doGet(request);
        }
    },

    /**
     * This function is used to search term or document within whole index
     * @param {request} request is used to carry request parameters sent by consumer
     * @param {callback} callback is a function, called after fullfilling business requirement 
     */
    doSearch: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (request.httpRequest.params.id) {
            request.query = {
                match: {
                    _id: request.httpRequest.params.id
                }
            };
        }
        if (callback) {
            FACADE.dsdName.doSearch(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.doSearch(request);
        }
    },

    /**
     * This function is used to put document within indeces
     * @param {request} request is used to carry request parameters sent by consumer
     * @param {callback} callback is a function, called after fullfilling business requirement 
     */
    doSave: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.dsdName.doSave(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.doSave(request);
        }
    },

    /**
     * This function is used to perform bulk operation within single or multiple indexes
     * @param {request} request is used to carry request parameters sent by consumer
     * @param {callback} callback is a function, called after fullfilling business requirement 
     */
    doBulk: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.dsdName.doBulk(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.doBulk(request);
        }
    },

    /**
     * This function is used to remove a document from index
     * @param {request} request is used to carry request parameters sent by consumer
     * @param {callback} callback is a function, called after fullfilling business requirement 
     */
    doRemove: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (request.httpRequest.params.id) {
            request.query = {
                id: request.httpRequest.params.id
            };
        }
        if (callback) {
            FACADE.dsdName.doRemove(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.doRemove(request);
        }
    },

    /**
     * This function is used to remove all documents based on query
     * @param {request} request is used to carry request parameters sent by consumer
     * @param {callback} callback is a function, called after fullfilling business requirement 
     */
    doRemoveByQuery: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.dsdName.doRemoveByQuery(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.doRemoveByQuery(request);
        }
    },

    /**
     * This function is used to get defined schema for the type
     * @param {request} request is used to carry request parameters sent by consumer
     * @param {callback} callback is a function, called after fullfilling business requirement 
     */
    doGetSchema: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.dsdName.doGetSchema(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.doGetSchema(request);
        }
    },

    /**
     * This function is used to update schema for the type
     * @param {request} request is used to carry request parameters sent by consumer
     * @param {callback} callback is a function, called after fullfilling business requirement 
     */
    doUpdateSchema: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.dsdName.doUpdateSchema(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.doUpdateSchema(request);
        }
    },

    /**
     * This function is used to remove type from index
     * @param {request} request is used to carry request parameters sent by consumer
     * @param {callback} callback is a function, called after fullfilling business requirement 
     */
    doRemoveIndex: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.dsdName.doRemoveIndex(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.doRemoveIndex(request);
        }
    },

    /**
     * This function is used to perform indexing
     * @param {request} request is used to carry request parameters sent by consumer
     * @param {callback} callback is a function, called after fullfilling business requirement 
     */
    doIndexing: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request.indexerCode = request.httpRequest.params.indexerCode || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.dsdName.doIndexing(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.doIndexing(request);
        }
    }
};