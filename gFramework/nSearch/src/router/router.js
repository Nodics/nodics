/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    default: {
        commonDoSearch: {
            doGetGet: {
                secured: true,
                key: '/schemaName/search/id/:id',
                method: 'GET',
                controller: 'DefaultctrlName',
                operation: 'doGet',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'doGet',
                    url: 'http://host:port/nodics/{moduleName}//schemaName/search/:id',
                }
            },
            doGetPost: {
                secured: true,
                key: '/schemaName/search',
                method: 'POST',
                controller: 'DefaultctrlName',
                operation: 'doGet',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'doGet',
                    url: 'http://host:port/nodics/{moduleName}//schemaName/search',
                }
            },
            doSavePut: {
                secured: true,
                key: '/schemaName/search',
                method: 'PUT',
                controller: 'DefaultctrlName',
                operation: 'doSave',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'PUT',
                    url: 'http://host:port/nodics/{moduleName}/schemaName/search',
                    body: '{ complete model object } or [{}, {}] array of models'
                }
            },
            doRemoveDeleteId: {
                secured: true,
                key: '/schemaName/search/id/:id',
                method: 'DELETE',
                controller: 'DefaultctrlName',
                operation: 'doRemove',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'DELETE',
                    url: 'http://host:port/nodics/{moduleName}/schemaName/search/id/:id',
                }
            },
            doRemoveDelete: {
                secured: true,
                key: '/schemaName/search',
                method: 'DELETE',
                controller: 'DefaultctrlName',
                operation: 'doRemove',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'DELETE',
                    url: 'http://host:port/nodics/{moduleName}/schemaName/search',
                }
            }
        }
    },

    nSearch: {
        indexing: {
            fullIndexing: {
                secured: true,
                key: '/index/full/:indexName/:indexType',
                method: 'POST',
                controller: 'DefaultSearchIndexingController',
                operation: 'fullIndex',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/search/index/full/:indexName/:indexType',
                    body: {
                        reloadSearchSchema: 'true / false'
                    }
                }
            },

            incrementalIndexing: {
                secured: true,
                key: '/index/incremental/:indexName/:indexType',
                method: 'POST',
                controller: 'DefaultSearchIndexingController',
                operation: 'fullIndex',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/search/index/full/:indexName/:indexType',
                    body: {
                        reloadSearchSchema: 'true / false'
                    }
                }
            }
        }
    }
};