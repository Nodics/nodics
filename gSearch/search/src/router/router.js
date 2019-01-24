/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    default: {
        defaultDoSearch: {
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
    common: {
        commonDoSearch: {
            doGetExists: {
                secured: true,
                key: '/:indexName/:typeName/search/exists/id/:id',
                method: 'GET',
                controller: 'DefaultSearchController',
                operation: 'doExists',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/:indexName/:typeName/search/exists/id/:id',
                }
            },
            // This operation belongs to conection level, which needs to be module level - need to re-validate it
            doGetCheckHealth: {
                secured: true,
                key: '/:indexName/:typeName/search/check/health',
                method: 'GET',
                controller: 'DefaultSearchController',
                operation: 'doCheckHealth',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/:indexName/:typeName/search/check/health',
                }
            },

            doGetGet: {
                secured: true,
                key: '/:indexName/:typeName/search/get/id/:id',
                method: 'GET',
                controller: 'DefaultSearchController',
                operation: 'doGet',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/:indexName/:typeName/search/get/id/:id',
                }
            },

            doGetSearch: {
                secured: true,
                key: '/:indexName/:typeName/search/id/:id',
                method: 'GET',
                controller: 'DefaultSearchController',
                operation: 'doSearch',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'doSearch',
                    url: 'http://host:port/nodics/{moduleName}/:indexName/:typeName/search/:id',
                }
            },

            doPostSearch: {
                secured: true,
                key: '/:indexName/:typeName/search',
                method: 'POST',
                controller: 'DefaultSearchController',
                operation: 'doSearch',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/{moduleName}/:indexName/:typeName/search',
                }
            },

            doPutSave: {
                secured: true,
                key: '/:indexName/:typeName/search',
                method: 'PUT',
                controller: 'DefaultSearchController',
                operation: 'doSave',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'PUT',
                    url: 'http://host:port/nodics/{moduleName}/:indexName/:typeName/search',
                    body: '{ complete model object } or [{}, {}] array of models'
                }
            },

            doGetRemove: {
                secured: true,
                key: '/:indexName/:typeName/search/id/:id',
                method: 'DELETE',
                controller: 'DefaultSearchController',
                operation: 'doRemove',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'DELETE',
                    url: 'http://host:port/nodics/{moduleName}/:indexName/:typeName/search/id/:id',
                }
            },

            doRemoveDelete: {
                secured: true,
                key: '/:indexName/:typeName/search',
                method: 'DELETE',
                controller: 'DefaultSearchController',
                operation: 'doRemoveByQuery',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'DELETE',
                    url: 'http://host:port/nodics/{moduleName}/:indexName/:typeName/search',
                }
            },

            doGetMapping: {
                secured: true,
                key: '/:indexName/:typeName/search/schema',
                method: 'GET',
                controller: 'DefaultSearchController',
                operation: 'getMapping',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/:indexName/:typeName/search/schema',
                }
            },

            doGetUpdateMapping: {
                secured: true,
                key: '/:indexName/:typeName/search/schema/update',
                method: 'GET',
                controller: 'DefaultSearchController',
                operation: 'updateMapping',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/:indexName/:typeName/search/schema/update',
                }
            },

            doGetRemoveType: {
                secured: true,
                key: '/:indexName/:typeName/search/type',
                method: 'DELETE',
                controller: 'DefaultSearchController',
                operation: 'removeType',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'DELETE',
                    url: 'http://host:port/nodics/{moduleName}/:indexName/:typeName/search/check/health',
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