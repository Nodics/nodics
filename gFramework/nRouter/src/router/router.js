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
    operations: {
        registerWeb: function (moduleRouter, moduleObject) {
            if (UTILS.isWebEnabled(moduleObject.metaData.name)) {
                try {
                    moduleObject.webRootDirName = CONFIG.get('webRootDirName');
                    moduleObject.webDistDirName = CONFIG.get('webDistDirName');
                    moduleConfig = CONFIG.get(moduleObject.metaData.name);
                    moduleObject.pages = UTILS.getPages(moduleObject.metaData.name);
                    moduleObject.entryHtmlPlugins = moduleConfig.getHtmlWebpackPlugin(moduleObject);
                    let webpackConfig = moduleConfig.getWebpackConfig(moduleObject);
                    const compiler = webpack(webpackConfig);
                    moduleRouter.use(require('webpack-dev-middleware')(compiler, {
                        publicPath: webpackConfig.output.publicPath,
                        writeToDisk: true
                    }));
                    moduleRouter.use('/' + CONFIG.get('server').options.contextRoot + '/' + moduleObject.metaData.name, Express.static(path.join(moduleObject.modulePath, '/' + moduleObject.webRootDirName)));
                } catch (error) {
                    SERVICE.DefaultRouterService.LOG.error(error);
                }
            }
        },
        get: function (moduleRouter, routerDef) {
            moduleRouter.get(routerDef.url, (req, res) => {
                try {
                    SERVICE.DefaultRequestHandlerPipelineService.startRequestHandlerPipeline(req, res, routerDef);
                } catch (error) {
                    SERVICE.DefaultRouterService.LOG.error(error);
                    res.json({
                        success: false,
                        code: 'ERR001',
                        msg: 'Process failed with errors',
                        error: error
                    });
                }
            });
        },
        post: function (moduleRouter, routerDef) {
            let bodyParserHandler = CONFIG.get('bodyParserHandler')[routerDef.bodyParserHandler] || CONFIG.get('bodyParserHandler').jsonBodyParserHandler;
            moduleRouter.post(routerDef.url, SERVICE[bodyParserHandler].getBodyParser(), (req, res) => {
                try {
                    SERVICE.DefaultRequestHandlerPipelineService.startRequestHandlerPipeline(req, res, routerDef);
                } catch (error) {
                    SERVICE.DefaultRouterService.LOG.error(error);
                    res.json({
                        success: false,
                        code: 'ERR001',
                        msg: 'Process failed with errors',
                        error: error
                    });
                }
            });
        },
        delete: function (moduleRouter, routerDef) {
            let bodyParserHandler = CONFIG.get('bodyParserHandler')[routerDef.bodyParserHandler] || CONFIG.get('bodyParserHandler').jsonBodyParserHandler;
            moduleRouter.delete(routerDef.url, SERVICE[bodyParserHandler].getBodyParser(), (req, res) => {
                try {
                    SERVICE.DefaultRequestHandlerPipelineService.startRequestHandlerPipeline(req, res, routerDef);
                } catch (error) {
                    SERVICE.DefaultRouterService.LOG.error(error);
                    res.json({
                        success: false,
                        code: 'ERR001',
                        msg: 'Process failed with errors',
                        error: error
                    });
                }
            });
        },
        put: function (moduleRouter, routerDef) {
            let bodyParserHandler = CONFIG.get('bodyParserHandler')[routerDef.bodyParserHandler] || CONFIG.get('bodyParserHandler').jsonBodyParserHandler;
            moduleRouter.put(routerDef.url, SERVICE[bodyParserHandler].getBodyParser(), (req, res) => {
                try {
                    SERVICE.DefaultRequestHandlerPipelineService.startRequestHandlerPipeline(req, res, routerDef);
                } catch (error) {
                    SERVICE.DefaultRouterService.LOG.error(error);
                    res.json({
                        success: false,
                        code: 'ERR001',
                        msg: 'Process failed with errors',
                        error: error
                    });
                }
            });
        },
        patch: function (moduleRouter, routerDef) {
            let bodyParserHandler = CONFIG.get('bodyParserHandler')[routerDef.bodyParserHandler] || CONFIG.get('bodyParserHandler').jsonBodyParserHandler;
            moduleRouter.patch(routerDef.url, SERVICE[bodyParserHandler].getBodyParser(), (req, res) => {
                try {
                    SERVICE.DefaultRequestHandlerPipelineService.startRequestHandlerPipeline(req, res, routerDef);
                } catch (error) {
                    SERVICE.DefaultRouterService.LOG.error(error);
                    res.json({
                        success: false,
                        code: 'ERR001',
                        msg: 'Process failed with errors',
                        error: error
                    });
                }
            });
        }
    },

    default: {
        commonGetterOperation: {
            get: {
                secured: true,
                cache: {
                    enabled: true,
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
                key: '/schemaName',
                method: 'DELETE',
                controller: 'DefaultctrlName',
                operation: 'remove',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'DELETE',
                    url: 'http://host:port/nodics/{moduleName}/schemaName/id/:id',
                }
            },
            removeById: {
                secured: true,
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
                key: '/schemaName/id',
                method: 'DELETE',
                controller: 'DefaultctrlName',
                operation: 'removeById',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'DELETE',
                    url: 'http://host:port/nodics/{moduleName}/schemaName',
                    body: ['id1', 'id2', 'id3', '...id n']
                }
            },
            removeByCode: {
                secured: true,
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
                key: '/schemaName/code',
                method: 'DELETE',
                controller: 'DefaultctrlName',
                operation: 'removeByCode',
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
            save: {
                secured: true,
                key: '/schemaName',
                method: 'PUT',
                controller: 'DefaultctrlName',
                operation: 'save',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'PUT',
                    url: 'http://host:port/nodics/{moduleName}/schemaName',
                    body: '{ complete model object } or [{}, {}] array of models'
                }
            }
        },
        commonUpdateOperations: {
            update: {
                secured: true,
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