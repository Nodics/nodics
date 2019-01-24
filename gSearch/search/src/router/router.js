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
            doGetExists: {
                secured: true,
                key: '/schemaName/search/exists/id/:id',
                method: 'GET',
                controller: 'DefaultctrlName',
                operation: 'doExists',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/schemaName/search/exists/id/:id',
                }
            },
            // This operation belongs to conection level, which needs to be module level - need to re-validate it
            doGetCheckHealth: {
                secured: true,
                key: '/schemaName/search/check/health',
                method: 'GET',
                controller: 'DefaultctrlName',
                operation: 'doCheckHealth',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/schemaName/search/check/health',
                }
            },

            doGetGet: {
                secured: true,
                key: '/schemaName/search/get/id/:id',
                method: 'GET',
                controller: 'DefaultctrlName',
                operation: 'doGet',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/schemaName/search/get/id/:id',
                }
            },

            doGetSearch: {
                secured: true,
                key: '/schemaName/search/id/:id',
                method: 'GET',
                controller: 'DefaultctrlName',
                operation: 'doSearch',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'doSearch',
                    url: 'http://host:port/nodics/{moduleName}/schemaName/search/:id',
                }
            },

            doPostSearch: {
                secured: true,
                key: '/schemaName/search',
                method: 'POST',
                controller: 'DefaultctrlName',
                operation: 'doSearch',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/{moduleName}/schemaName/search',
                }
            },

            doPutSave: {
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

            doGetRemove: {
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
                operation: 'doRemoveByQuery',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'DELETE',
                    url: 'http://host:port/nodics/{moduleName}/schemaName/search',
                }
            },

            doGetMapping: {
                secured: true,
                key: '/schemaName/search/schema',
                method: 'GET',
                controller: 'DefaultctrlName',
                operation: 'getMapping',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/schemaName/search/schema',
                }
            },

            doGetUpdateMapping: {
                secured: true,
                key: '/schemaName/search/schema/update',
                method: 'GET',
                controller: 'DefaultctrlName',
                operation: 'updateMapping',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/schemaName/search/schema/update',
                }
            },

            doGetRemoveType: {
                secured: true,
                key: '/schemaName/search/type',
                method: 'DELETE',
                controller: 'DefaultctrlName',
                operation: 'removeType',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'DELETE',
                    url: 'http://host:port/nodics/{moduleName}/schemaName/search/check/health',
                }
            },

        }
    },

    search: {
        indexing: {
            fullIndexing: {
                secured: true,
                key: '/index/full/:indexName/:typeName',
                method: 'POST',
                controller: 'DefaultSearchIndexingController',
                operation: 'fullIndex',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/search/index/full/:indexName/:typeName',
                    body: {
                        reloadSearchSchema: 'true / false'
                    }
                }
            },

            incrementalIndexing: {
                secured: true,
                key: '/index/incremental/:indexName/:typeName',
                method: 'POST',
                controller: 'DefaultSearchIndexingController',
                operation: 'fullIndex',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/search/index/full/:indexName/:typeName',
                    body: {
                        reloadSearchSchema: 'true / false'
                    }
                }
            }
        }
    }
};