/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const express = require('express');
const path = require('path');
const webpack = require('webpack');

module.exports = {
    operations: {
        registerWeb: function (app, moduleObject) {
            if (moduleObject.metaData.web) {
                try {
                    moduleObject.webRootDirName = CONFIG.get('webRootDirName');
                    moduleObject.webDistDirName = CONFIG.get('webDistDirName');
                    moduleConfig = CONFIG.get(moduleObject.metaData.name);
                    moduleObject.pages = UTILS.getPages(moduleObject.metaData.name);
                    moduleObject.entryHtmlPlugins = moduleConfig.getHtmlWebpackPlugin(moduleObject);
                    let webpackConfig = moduleConfig.getWebpackConfig(moduleObject);
                    const compiler = webpack(webpackConfig);
                    app.use(require('webpack-dev-middleware')(compiler, {
                        publicPath: webpackConfig.output.publicPath,
                        writeToDisk: true
                    }));
                    app.use('/' + CONFIG.get('server').options.contextRoot + '/' + moduleObject.metaData.name, express.static(path.join(moduleObject.modulePath, '/' + moduleObject.webRootDirName)));
                } catch (error) {
                    SYSTEM.LOG.error(error);
                }
            }
        },
        get: function (app, routerDef) {
            if (routerDef.cache && routerDef.cache.enabled && routerDef.moduleObject.apiCache) {
                app.route(routerDef.url).get((req, res, next) => {
                    SERVICE.DefaultCacheService.getApi(routerDef.moduleObject.apiCache, req, res).then(value => {
                        SYSTEM.LOG.info('      Fulfilled from API cache');
                        value.cache = 'api hit';
                        res.json(value);
                    }).catch(error => {
                        next();
                    });
                }, (req, res) => {
                    SERVICE.DefaultRequestHandlerPipelineService.startRequestHandlerPipeline(req, res, routerDef);
                });
            } else {
                app.route(routerDef.url).get((req, res) => {
                    SERVICE.DefaultRequestHandlerPipelineService.startRequestHandlerPipeline(req, res, routerDef);
                });
            }
        },
        post: function (app, routerDef) {
            if (routerDef.cache && routerDef.cache.enabled && routerDef.moduleObject.apiCache) {
                app.route(routerDef.url).post((req, res, next) => {
                    SERVICE.DefaultCacheService.getApi(routerDef.moduleObject.apiCache, req, res).then(value => {
                        SYSTEM.LOG.info('      Fulfilled from API cache');
                        value.cache = 'api hit';
                        res.json(value);
                    }).catch(error => {
                        next();
                    });
                }, (req, res) => {
                    SERVICE.DefaultRequestHandlerPipelineService.startRequestHandlerPipeline(req, res, routerDef);
                });
            } else {
                app.route(routerDef.url).post((req, res) => {
                    SERVICE.DefaultRequestHandlerPipelineService.startRequestHandlerPipeline(req, res, routerDef);
                });
            }
        },
        delete: function (app, routerDef) {
            app.route(routerDef.url).delete((req, res) => {
                SERVICE.DefaultRequestHandlerPipelineService.startRequestHandlerPipeline(req, res, routerDef);
            });
        },
        put: function (app, routerDef) {
            app.route(routerDef.url).put((req, res) => {
                SERVICE.DefaultRequestHandlerPipelineService.startRequestHandlerPipeline(req, res, routerDef);
            });
        }
    },

    default: {
        commonGetterOperation: {
            getModel: {
                secured: true,
                cache: {
                    enabled: false,
                    ttl: 40
                },
                key: '/schemaName',
                method: 'GET',
                controller: 'DefaultcontrollerName',
                operation: 'get',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/schemaName/',
                }
            },
            postModel: {
                secured: true,
                cache: {
                    enabled: false,
                    ttl: 20
                },
                key: '/schemaName',
                method: 'POST',
                controller: 'DefaultcontrollerName',
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
                cache: {
                    enabled: false,
                    ttl: 20
                },
                key: '/schemaName/id/:id',
                method: 'GET',
                controller: 'DefaultcontrollerName',
                operation: 'get',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/schemaName/id/:id',
                }
            }
        },
        commonRemoveOperations: {
            removeById: {
                secured: true,
                key: '/schemaName/id/:id',
                method: 'DELETE',
                controller: 'DefaultcontrollerName',
                operation: 'remove',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'DELETE',
                    url: 'http://host:port/nodics/{moduleName}/schemaName/id/:id',
                }
            },
            removeByIds: {
                secured: true,
                key: '/schemaName',
                method: 'DELETE',
                controller: 'DefaultcontrollerName',
                operation: 'remove',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'DELETE',
                    url: 'http://host:port/nodics/{moduleName}/schemaName',
                    body: ['id1', 'id2', 'id3', '...id n']
                }
            }
        },
        commonSaveOperations: {
            saveModels: {
                secured: true,
                key: '/schemaName',
                method: 'PUT',
                controller: 'DefaultcontrollerName',
                operation: 'save',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'PUT',
                    url: 'http://host:port/nodics/{moduleName}/schemaName',
                    body: '{ complete model object } or [{}, {}] array of models'
                }
            }
        }
    },

    common: {
        pingMe: {
            iAmLive: {
                secured: false,
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

        flushAPICache: {
            flushAll: {
                secured: true,
                key: '/cache/api/flush',
                method: 'GET',
                controller: 'CacheController',
                operation: 'flushApiCache',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/cache/api/flush'
                }
            }
        },

        flushItemCache: {
            flushAll: {
                secured: true,
                key: '/cache/item/flush',
                method: 'GET',
                controller: 'DefaultCacheController',
                operation: 'flushItemCache',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/cache/item/flush'
                }
            },
            flushPrefix: {
                secured: true,
                key: '/cache/item/flush/:prefix',
                method: 'GET',
                controller: 'DefaultCacheController',
                operation: 'flushItemCache',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/cache/item/flush/:prefix',
                    body: 'prefix could be schema name like schemaName or schemaName_tenant'
                }
            },
            flushKeys: {
                secured: true,
                key: '/cache/item/flush',
                method: 'POST',
                controller: 'DefaultCacheController',
                operation: 'flushItemCacheKeys',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/{moduleName}/cache/item/flush',
                    body: '[key1, key2, key3, key...n]'
                }
            },
        },
        changeCacheConfig: {
            apiConfig: {
                secured: true,
                key: '/cache/api',
                method: 'POST',
                controller: 'DefaultCacheController',
                operation: 'changeApiCacheConfiguration',
                help: {
                    message: 'not supported currently',
                }
            },
            itemConfig: {
                secured: true,
                key: '/cache/item',
                method: 'POST',
                controller: 'DefaultCacheController',
                operation: 'changeItemCacheConfiguration',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
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
        },
        changeLogLevel: {
            changeLevelPost: {
                secured: true,
                key: '/log/level',
                method: 'POST',
                controller: 'DefaultLogController',
                operation: 'changeLogLevel',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/log/level',
                    body: {
                        entityName: 'like EnterpriseService',
                        logLevel: 'like info, debug, error and all valid log levels'
                    }
                }
            }
        }
    }
};