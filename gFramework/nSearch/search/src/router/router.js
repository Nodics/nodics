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
                accessGroups: ['userGroup'],
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
                accessGroups: ['userGroup'],
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

            doGetCheckHealth: {
                secured: true,
                accessGroups: ['userGroup'],
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
                accessGroups: ['userGroup'],
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

            doGetExists: {
                secured: true,
                accessGroups: ['userGroup'],
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
                accessGroups: ['userGroup'],
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

            doGetGet: {
                secured: true,
                accessGroups: ['userGroup'],
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
                accessGroups: ['userGroup'],
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
                accessGroups: ['userGroup'],
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
                accessGroups: ['userGroup'],
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

            doPutSave: {
                secured: true,
                accessGroups: ['userGroup'],
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
                accessGroups: ['userGroup'],
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

            doGetRemove: {
                secured: true,
                accessGroups: ['userGroup'],
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
                accessGroups: ['userGroup'],
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

            doGetSchema: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/schemaName/search/schema',
                method: 'GET',
                controller: 'DefaultctrlName',
                operation: 'doGetSchema',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/schemaName/search/schema',
                }
            },

            doPostSchema: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/schemaName/search/schema',
                method: 'POST',
                controller: 'DefaultctrlName',
                operation: 'doGetSchema',
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

            doGetUpdateSchema: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/schemaName/search/schema/update',
                method: 'GET',
                controller: 'DefaultctrlName',
                operation: 'doUpdateSchema',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/schemaName/search/schema/update',
                }
            },

            doPOSTUpdateSchema: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/schemaName/search/schema/update',
                method: 'POST',
                controller: 'DefaultctrlName',
                operation: 'doUpdateSchema',
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

            doGetRemoveIndex: {
                secured: true,
                accessGroups: ['userGroup'],
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
            },
            doGetIndex: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/schemaName/search/index/:indexerCode',
                method: 'GET',
                controller: 'DefaultctrlName',
                operation: 'doIndexing',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/schemaName/search/index/:indexerCode',
                }
            },
            doPostIndex: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/schemaName/search/index',
                method: 'POST',
                controller: 'DefaultctrlName',
                operation: 'doIndexing',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/{moduleName}/schemaName/search/index',
                    body: {
                        options: '{ object of options required for this option }',
                        indexerCode: ''
                    }
                }
            }
        }
    },
    common: {
        commonDoSearch: {
            doGetRefresh: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/:indexName/search/refresh',
                method: 'GET',
                controller: 'DefaultSearchController',
                operation: 'doRefresh',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/:indexName/search/refresh',
                }
            },

            doPostRefresh: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/:indexName/search/refresh',
                method: 'POST',
                controller: 'DefaultSearchController',
                operation: 'doRefresh',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/{moduleName}/:indexName/search/refresh',
                    body: {
                        options: '{ object of options required for this option }'
                    }
                }
            },

            doGetCheckHealth: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/:indexName/search/check/health',
                method: 'GET',
                controller: 'DefaultSearchController',
                operation: 'doCheckHealth',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/:indexName/search/check/health',
                }
            },

            doPostCheckHealth: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/:indexName/search/check/health',
                method: 'POST',
                controller: 'DefaultSearchController',
                operation: 'doCheckHealth',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/{moduleName}/:indexName/search/check/health',
                    body: {
                        options: '{ object of options required for this option }'
                    }
                }
            },

            doGetExists: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/:indexName/search/exists/id/:id',
                method: 'GET',
                controller: 'DefaultSearchController',
                operation: 'doExists',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/:indexName/search/exists/id/:id',
                }
            },

            doPostExists: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/:indexName/search/exists',
                method: 'POST',
                controller: 'DefaultSearchController',
                operation: 'doExists',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/{moduleName}/:indexName/search/exists',
                    body: {
                        options: '{ object of options required for this option }',
                        query: {
                            id: ' Id of document to check if exists'
                        }
                    }
                }
            },

            doGetGet: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/:indexName/search/get/id/:id',
                method: 'GET',
                controller: 'DefaultSearchController',
                operation: 'doGet',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/:indexName/search/get/id/:id',
                }
            },

            doPostGet: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/:indexName/search/get',
                method: 'POST',
                controller: 'DefaultSearchController',
                operation: 'doGet',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/{moduleName}/:indexName/search/get',
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
                accessGroups: ['userGroup'],
                key: '/:indexName/search/id/:id',
                method: 'GET',
                controller: 'DefaultSearchController',
                operation: 'doSearch',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'doSearch',
                    url: 'http://host:port/nodics/{moduleName}/:indexName/search/:id',
                }
            },

            doPostSearch: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/:indexName/search',
                method: 'POST',
                controller: 'DefaultSearchController',
                operation: 'doSearch',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/{moduleName}/:indexName/search',
                    body: {
                        options: '{ object of options required for this option }',
                        query: '{ object of elastic search query }'
                    }
                }
            },

            doPutSave: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/:indexName/search',
                method: 'PUT',
                controller: 'DefaultSearchController',
                operation: 'doSave',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'PUT',
                    url: 'http://host:port/nodics/{moduleName}/:indexName/search',
                    body: {
                        options: '{ options to pass to save these items }',
                        models: '[ array of models to save ]'
                    }
                }
            },

            doPostBulk: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/:indexName/search/all',
                method: 'PUT',
                controller: 'DefaultSearchController',
                operation: 'doBulk',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'PUT',
                    url: 'http://host:port/nodics/{moduleName}/:indexName/search',
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

            doGetRemove: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/:indexName/search/id/:id',
                method: 'DELETE',
                controller: 'DefaultSearchController',
                operation: 'doRemove',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'DELETE',
                    url: 'http://host:port/nodics/{moduleName}/:indexName/search/id/:id',
                }
            },

            doPostRemove: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/:indexName/search',
                method: 'DELETE',
                controller: 'DefaultSearchController',
                operation: 'doRemoveByQuery',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'DELETE',
                    url: 'http://host:port/nodics/{moduleName}/:indexName/search',
                    body: {
                        options: '{ object of options required for this option }',
                        query: '{ object of elastic search query }'
                    }
                }
            },

            doGetSchema: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/:indexName/search/schema',
                method: 'GET',
                controller: 'DefaultSearchController',
                operation: 'doGetSchema',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/:indexName/search/schema',
                }
            },

            doPostSchema: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/:indexName/search/schema',
                method: 'POST',
                controller: 'DefaultSearchController',
                operation: 'doGetSchema',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/:indexName/search/schema',
                    body: {
                        options: '{ object of options required for this option }'
                    }
                }
            },

            doGetUpdateSchema: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/:indexName/search/schema/update',
                method: 'GET',
                controller: 'DefaultSearchController',
                operation: 'doUpdateSchema',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/:indexName/search/schema/update',
                }
            },

            doPostUpdateSchema: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/:indexName/search/schema/update',
                method: 'POST',
                controller: 'DefaultSearchController',
                operation: 'doUpdateSchema',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/{moduleName}/:indexName/search/schema/update',
                    body: {
                        options: '{ object of options required for this option }'
                    }
                }
            },

            doGetRemoveIndex: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/:indexName/search/index',
                method: 'DELETE',
                controller: 'DefaultSearchController',
                operation: 'doRemoveIndex',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'DELETE',
                    url: 'http://host:port/nodics/{moduleName}/:indexName/search/type',
                    body: {
                        options: '{ object of options required for this option }'
                    }
                }
            },
            doGetIndex: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/:indexName/search/index/:indexerCode',
                method: 'GET',
                controller: 'DefaultSearchController',
                operation: 'doIndexing',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/search/index/:indexerCode',
                }
            },
            doPostIndex: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/:indexName/search/index',
                method: 'POST',
                controller: 'DefaultSearchController',
                operation: 'doIndexing',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/{moduleName}/search/index',
                    body: {
                        options: '{ object of options required for this option }',
                        indexerCode: ''
                    }
                }
            }
        }
    }
};