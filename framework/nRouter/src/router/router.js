/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    operations: {
        get: function(app, routerDef) {
            if (routerDef.cache && routerDef.cache.enabled && routerDef.moduleObject.apiCache) {
                app.route(routerDef.url).get((req, res, next) => {
                    SERVICE.CacheService.getApi(routerDef.moduleObject.apiCache, req, res).then(value => {
                        console.log('      Fulfilled from API cache');
                        value.cache = 'api hit';
                        res.json(value);
                    }).catch(error => {
                        next();
                    });
                }, (req, res) => {
                    SERVICE.RequestHandlerProcessService.startRequestHandlerProcess(req, res, routerDef);
                });
            } else {
                app.route(routerDef.url).get((req, res) => {
                    SERVICE.RequestHandlerProcessService.startRequestHandlerProcess(req, res, routerDef);
                });
            }
        },
        post: function(app, routerDef) {
            if (routerDef.cache && routerDef.cache.enabled && routerDef.moduleObject.apiCache) {
                app.route(routerDef.url).post((req, res, next) => {
                    SERVICE.CacheService.getApi(routerDef.moduleObject.apiCache, req, res).then(value => {
                        console.log('      Fulfilled from API cache');
                        value.cache = 'api hit';
                        res.json(value);
                    }).catch(error => {
                        next();
                    });
                }, (req, res) => {
                    SERVICE.RequestHandlerProcessService.startRequestHandlerProcess(req, res, routerDef);
                });
            } else {
                app.route(routerDef.url).post((req, res) => {
                    SERVICE.RequestHandlerProcessService.startRequestHandlerProcess(req, res, routerDef);
                });
            }
        },
        delete: function(app, routerDef) {
            app.route(routerDef.url).delete((req, res) => {
                SERVICE.RequestHandlerProcessService.startRequestHandlerProcess(req, res, routerDef);
            });
        },
        put: function(app, routerDef) {
            app.route(routerDef.url).put((req, res) => {
                SERVICE.RequestHandlerProcessService.startRequestHandlerProcess(req, res, routerDef);
            });
        }
    },

    default: {
        commonGetterOperation: {
            getModel: {
                secured: false,
                cache: {
                    enabled: true,
                    ttl: 40
                },
                key: '/schemaName',
                method: 'GET',
                controller: 'CONTROLLER.controllerName.get'
            },
            postModel: {
                secured: false,
                cache: {
                    enabled: false,
                    ttl: 20
                },
                key: '/schemaName',
                method: 'POST',
                controller: 'CONTROLLER.controllerName.get'
            },
            getById: {
                secured: true,
                cache: {
                    enabled: false,
                    ttl: 20
                },
                key: '/schemaName/id/:id',
                method: 'GET',
                controller: 'CONTROLLER.controllerName.getById'
            }
        },
        commonRemoveOperations: {
            deleteById: {
                secured: true,
                key: '/schemaName/id',
                method: 'DELETE',
                controller: 'CONTROLLER.controllerName.removeById'
            },
            deleteByIds: {
                secured: true,
                key: '/schemaName/id/:id',
                method: 'DELETE',
                controller: 'CONTROLLER.controllerName.removeById'
            }
        },
        commonSaveOperations: {
            saveModels: {
                secured: false,
                key: '/schemaName',
                method: 'PUT',
                controller: 'CONTROLLER.controllerName.save'
            }
        },
        commonUpdateOperations: {
            saveModels: {
                secured: false,
                key: '/schemaName/update',
                method: 'PUT',
                controller: 'CONTROLLER.controllerName.update'
            }
        },

        commonSaveOrUpdateOperations: {
            saveModels: {
                secured: false,
                key: '/schemaName/saveOrUpdate',
                method: 'PUT',
                controller: 'CONTROLLER.controllerName.saveOrUpdate'
            }
        }
    },

    common: {
        flushAPICache: {
            flushAll: {
                secured: true,
                key: '/cache/api/flush',
                method: 'GET',
                controller: 'CONTROLLER.CacheController.flushApiCache'
            },
            flushPrefix: {
                secured: true,
                key: '/cache/api/flush/:prefix',
                method: 'GET',
                controller: 'CONTROLLER.CacheController.flushApiCache'
            },
            flushKeys: {
                secured: true,
                key: '/cache/api/flush',
                method: 'POST',
                controller: 'CONTROLLER.CacheController.flushApiCacheKeys'
            },
        },

        flushItemCache: {
            flushAll: {
                secured: true,
                key: '/cache/item/flush',
                method: 'GET',
                controller: 'CONTROLLER.CacheController.flushItemCache'
            },
            flushPrefix: {
                secured: true,
                key: '/cache/item/flush/:prefix',
                method: 'GET',
                controller: 'CONTROLLER.CacheController.flushItemCache'
            },
            flushKeys: {
                secured: true,
                key: '/cache/item/flush',
                method: 'POST',
                controller: 'CONTROLLER.CacheController.flushItemCacheKeys'
            },
        }
    }
};