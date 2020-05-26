/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const Express = require('express');
const path = require('path');

module.exports = {
    default: {
        commonGetterOperation: {
            get: {
                secured: true,
                accessGroups: ['userGroup'],
                cache: {
                    enabled: false,
                    ttl: 180,
                },
                key: '/schemaName',
                method: 'GET',
                controller: 'DefaultctrlName',
                operation: 'get',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/schemaName/',
                }
            },
            post: {
                secured: true,
                accessGroups: ['userGroup'],
                cache: {
                    enabled: false,
                    ttl: 20
                },
                key: '/schemaName',
                method: 'POST',
                controller: 'DefaultctrlName',
                operation: 'get',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/{moduleName}/schemaName/',
                    body: {
                        recursive: 'optional true/false - default is false',
                        pageSize: 'optional default value is 10',
                        pageNumber: 'optiona default value is 0',
                        sort: '',
                        select: '',
                        query: 'optional MongoDB based conditions can be put here, default is {}'
                    }
                }
            },
            getById: {
                secured: true,
                accessGroups: ['userGroup'],
                cache: {
                    enabled: false,
                    ttl: 60
                },
                key: '/schemaName/id/:id',
                method: 'GET',
                controller: 'DefaultctrlName',
                operation: 'get',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/schemaName/id/:id',
                }
            },
            getByCode: {
                secured: true,
                accessGroups: ['userGroup'],
                cache: {
                    enabled: false,
                    ttl: 20
                },
                key: '/schemaName/code/:code',
                method: 'GET',
                controller: 'DefaultctrlName',
                operation: 'get',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/schemaName/code/:code',
                }
            }
        },
        commonRemoveOperations: {
            remove: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/schemaName',
                method: 'DELETE',
                controller: 'DefaultctrlName',
                operation: 'remove',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'DELETE',
                    url: 'http://host:port/nodics/{moduleName}/schemaName/id/:id',
                    body: {
                        options: {
                            returnModified: 'true/false'
                        },
                        query: 'query object'
                    }
                }
            },
            removeById: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/schemaName/id/:id',
                method: 'DELETE',
                controller: 'DefaultctrlName',
                operation: 'removeById',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'DELETE',
                    url: 'http://host:port/nodics/{moduleName}/schemaName/id/:id',
                }
            },
            removeByIds: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/schemaName/id',
                method: 'DELETE',
                controller: 'DefaultctrlName',
                operation: 'removeById',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'DELETE',
                    url: 'http://host:port/nodics/{moduleName}/schemaName',
                    body: {
                        options: {
                            returnModified: 'true/false'
                        },
                        ids: ['id1', 'id2', 'id3', '...id n']
                    }
                }
            },
            removeByCode: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/schemaName/code/:code',
                method: 'DELETE',
                controller: 'DefaultctrlName',
                operation: 'removeByCode',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'DELETE',
                    url: 'http://host:port/nodics/{moduleName}/schemaName/id/:id',
                }
            },
            removeByCodes: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/schemaName/code',
                method: 'DELETE',
                controller: 'DefaultctrlName',
                operation: 'removeByCode',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'DELETE',
                    url: 'http://host:port/nodics/{moduleName}/schemaName/code',
                    body: {
                        options: {
                            returnModified: 'true/false'
                        },
                        codes: ['code1', 'code2', 'code3', '...code n']
                    }
                }
            }
        },
        commonSaveOperations: {
            save: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/schemaName',
                method: 'PUT',
                controller: 'DefaultctrlName',
                operation: 'save',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'PUT',
                    url: 'http://host:port/nodics/{moduleName}/schemaName',
                    body: '{ complete model object }'
                }
            },
            saveAll: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/schemaName/all',
                method: 'PUT',
                controller: 'DefaultctrlName',
                operation: 'saveAll',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'PUT',
                    url: 'http://host:port/nodics/{moduleName}/schemaName/all',
                    body: '[{}, {}] array of models'
                }
            }
        },
        commonUpdateOperations: {
            update: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/schemaName',
                method: 'PATCH',
                controller: 'DefaultctrlName',
                operation: 'update',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'PATCH',
                    url: 'http://host:port/nodics/{moduleName}/schemaName',
                    body: '{ complete model object } or [{}, {}] array of models'
                }
            }
        }
    },

    common: {
        pingMe: {
            iAmLive: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/ping',
                method: 'GET',
                handler: 'DefaultPingMeController',
                operation: 'ping',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/ping',
                    body: '{ complete model object } or [{}, {}] array of models'
                }
            }
        },

        flushCache: {
            flushKey: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/cache/:channelName/flush/key/:key',
                method: 'GET',
                controller: 'DefaultCacheController',
                operation: 'flushCache',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/cache/:channelName/flush/key/:key'
                }
            },
            flushPrefix: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/cache/:channelName/flush/prefix/:prefix',
                method: 'GET',
                controller: 'DefaultCacheController',
                operation: 'flushCache',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/cache/:channelName/flush/prefix/:prefix'
                }
            },
            flushAPIAll: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/cache/:channelName/flush',
                method: 'GET',
                controller: 'DefaultCacheController',
                operation: 'flushCache',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/cache/:channelName/flush'
                }
            },
            flushAPIKeys: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/cache/:channelName/flush',
                method: 'POST',
                controller: 'DefaultCacheController',
                operation: 'flushApiCache',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/cache/:channelName/flush'
                }
            }
        },

        updateRouterCacheConfig: {
            apiConfig: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/cache/api',
                method: 'POST',
                controller: 'DefaultCacheController',
                operation: 'updateRouterCacheConfiguration',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/{moduleName}/cache/api',
                    body: {
                        routerName: 'like get, getById or getByCode',
                        schemaName: 'like enterprise',
                        config: {
                            enabled: 'true/false',
                            ttl: 100
                        }
                    }
                }
            },
        },

        updateSchemaCacheConfig: {
            itemConfig: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/cache/item',
                method: 'POST',
                controller: 'DefaultCacheController',
                operation: 'updateSchemaCacheConfiguration',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/{moduleName}/cache/item',
                    body: {
                        schemaName: 'like enterprise',
                        cache: {
                            enabled: 'true/false',
                            ttl: 100
                        }
                    }
                }
            }
        }
    }
};