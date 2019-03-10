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
            doGetRefresh: {
                secured: true,
                key: '/schemaName/search/refresh',
                method: 'GET',
                controller: 'DefaultctrlName',
                operation: 'doRefresh',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/schemaName/search/refresh',
                }
            },

            doPostRefresh: {
                secured: true,
                key: '/schemaName/search/refresh',
                method: 'POST',
                controller: 'DefaultctrlName',
                operation: 'doRefresh',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/{moduleName}/schemaName/search/refresh',
                    body: {
                        options: '{ object of options required for this option }'
                    }
                }
            },

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

            doPostExists: {
                secured: true,
                key: '/schemaName/search/exists',
                method: 'POST',
                controller: 'DefaultctrlName',
                operation: 'doExists',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/{moduleName}/schemaName/search/exists',
                    body: {
                        options: '{ object of options required for this option }',
                        query: {
                            id: ' Id of document to check if exists'
                        }
                    }
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

            doPostCheckHealth: {
                secured: true,
                key: '/schemaName/search/check/health',
                method: 'POST',
                controller: 'DefaultctrlName',
                operation: 'doCheckHealth',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/{moduleName}/schemaName/search/check/health',
                    body: {
                        options: '{ object of options required for this option }'
                    }
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
                    body: {
                        options: '{ options to pass to save these items }',
                        models: '[ array of models to save ]'
                    }
                }
            },

            doPostBulk: {
                secured: true,
                key: '/schemaName/search/all',
                method: 'PUT',
                controller: 'DefaultctrlName',
                operation: 'doBulk',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'PUT',
                    url: 'http://host:port/nodics/{moduleName}/schemaName/search',
                    body: {
                        options: '{ options to pass to save these items }',
                        data: [{ // action description
                            index: {
                                _index: 'myindex',
                                _type: 'mytype',
                                _id: 1
                            }
                        }, { // the document to index
                            title: 'foo'
                        }, { // action description
                            update: {
                                _index: 'myindex',
                                _type: 'mytype',
                                _id: 2
                            }
                        }, { // the document to update
                            doc: { title: 'foo' }
                        }, { // action description
                            delete: {
                                _index: 'myindex',
                                _type: 'mytype',
                                _id: 3
                            }
                        }]
                    }
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

            doPostGet: {
                secured: true,
                key: '/schemaName/search/get',
                method: 'POST',
                controller: 'DefaultctrlName',
                operation: 'doGet',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/{moduleName}/schemaName/search/get',
                    body: {
                        options: '{ object of options required for this option }',
                        query: {
                            id: ' Id of document to check if exists'
                        }
                    }
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
                    body: {
                        options: '{ object of options required for this option }',
                        query: '{ object of elastic search query }'
                    }
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

            doPostRemove: {
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
                    body: {
                        options: '{ object of options required for this option }',
                        query: '{ object of elastic search query }'
                    }
                }
            },

            doGetMapping: {
                secured: true,
                key: '/schemaName/search/schema',
                method: 'GET',
                controller: 'DefaultctrlName',
                operation: 'doGetMapping',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/schemaName/search/schema',
                }
            },

            doPostMapping: {
                secured: true,
                key: '/schemaName/search/schema',
                method: 'POST',
                controller: 'DefaultctrlName',
                operation: 'doGetMapping',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/schemaName/search/schema',
                    body: {
                        options: '{ object of options required for this option }'
                    }
                }
            },

            doGetUpdateMapping: {
                secured: true,
                key: '/schemaName/search/schema/update',
                method: 'GET',
                controller: 'DefaultctrlName',
                operation: 'doUpdateMapping',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/schemaName/search/schema/update',
                }
            },

            doPOSTUpdateMapping: {
                secured: true,
                key: '/schemaName/search/schema/update',
                method: 'POST',
                controller: 'DefaultctrlName',
                operation: 'doUpdateMapping',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/{moduleName}/schemaName/search/schema/update',
                    body: {
                        options: '{ object of options required for this option }'
                    }
                }
            },

            doGetRemoveType: {
                secured: true,
                key: '/schemaName/search/index',
                method: 'DELETE',
                controller: 'DefaultctrlName',
                operation: 'doRemoveIndex',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'DELETE',
                    url: 'http://host:port/nodics/{moduleName}/schemaName/search/index',
                    body: {
                        options: '{ object of options required for this option }'
                    }
                }
            }
        }
    },
    common: {
        defaultDoSearch: {
            doGetRefresh: {
                secured: true,
                key: '/:indexName/:typeName/search/refresh',
                method: 'GET',
                controller: 'DefaultSearchController',
                operation: 'doRefresh',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/:indexName/:typeName/search/refresh',
                }
            },

            doPostRefresh: {
                secured: true,
                key: '/:indexName/:typeName/search/refresh',
                method: 'POST',
                controller: 'DefaultSearchController',
                operation: 'doRefresh',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/{moduleName}/:indexName/:typeName/search/refresh',
                    body: {
                        options: '{ object of options required for this option }'
                    }
                }
            },

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

            doPostExists: {
                secured: true,
                key: '/:indexName/:typeName/search/exists',
                method: 'POST',
                controller: 'DefaultSearchController',
                operation: 'doExists',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/{moduleName}/:indexName/:typeName/search/exists',
                    body: {
                        options: '{ object of options required for this option }',
                        query: {
                            id: ' Id of document to check if exists'
                        }
                    }
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

            doPostCheckHealth: {
                secured: true,
                key: '/:indexName/:typeName/search/check/health',
                method: 'POST',
                controller: 'DefaultSearchController',
                operation: 'doCheckHealth',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/{moduleName}/:indexName/:typeName/search/check/health',
                    body: {
                        options: '{ object of options required for this option }'
                    }
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
                    body: {
                        options: '{ options to pass to save these items }',
                        models: '[ array of models to save ]'
                    }
                }
            },

            doPostBulk: {
                secured: true,
                key: '/:indexName/:typeName/search/all',
                method: 'PUT',
                controller: 'DefaultSearchController',
                operation: 'doBulk',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'PUT',
                    url: 'http://host:port/nodics/{moduleName}/:indexName/:typeName/search',
                    body: {
                        options: '{ options to pass to save these items }',
                        data: [{ // action description
                            index: {
                                _index: 'myindex',
                                _type: 'mytype',
                                _id: 1
                            }
                        }, { // the document to index
                            title: 'foo'
                        }, { // action description
                            update: {
                                _index: 'myindex',
                                _type: 'mytype',
                                _id: 2
                            }
                        }, { // the document to update
                            doc: { title: 'foo' }
                        }, { // action description
                            delete: {
                                _index: 'myindex',
                                _type: 'mytype',
                                _id: 3
                            }
                        }]
                    }
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

            doPostGet: {
                secured: true,
                key: '/:indexName/:typeName/search/get',
                method: 'POST',
                controller: 'DefaultSearchController',
                operation: 'doGet',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/{moduleName}/:indexName/:typeName/search/get',
                    body: {
                        options: '{ object of options required for this option }',
                        query: {
                            id: ' Id of document to check if exists'
                        }
                    }
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
                    body: {
                        options: '{ object of options required for this option }',
                        query: '{ object of elastic search query }'
                    }
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

            doPostRemove: {
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
                    body: {
                        options: '{ object of options required for this option }',
                        query: '{ object of elastic search query }'
                    }
                }
            },

            doGetMapping: {
                secured: true,
                key: '/:indexName/:typeName/search/schema',
                method: 'GET',
                controller: 'DefaultSearchController',
                operation: 'doGetMapping',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/:indexName/:typeName/search/schema',
                }
            },

            doPostMapping: {
                secured: true,
                key: '/:indexName/:typeName/search/schema',
                method: 'POST',
                controller: 'DefaultSearchController',
                operation: 'doGetMapping',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/:indexName/:typeName/search/schema',
                    body: {
                        options: '{ object of options required for this option }'
                    }
                }
            },

            doGetUpdateMapping: {
                secured: true,
                key: '/:indexName/:typeName/search/schema/update',
                method: 'GET',
                controller: 'DefaultSearchController',
                operation: 'doUpdateMapping',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/:indexName/:typeName/search/schema/update',
                }
            },

            doPostUpdateMapping: {
                secured: true,
                key: '/:indexName/:typeName/search/schema/update',
                method: 'POST',
                controller: 'DefaultSearchController',
                operation: 'doUpdateMapping',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/{moduleName}/:indexName/:typeName/search/schema/update',
                    body: {
                        options: '{ object of options required for this option }'
                    }
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
                    url: 'http://host:port/nodics/{moduleName}/:indexName/:typeName/search/type',
                    body: {
                        options: '{ object of options required for this option }'
                    }
                }
            }
        }
    },
    search: {
        indexing: {

        }
    }
};