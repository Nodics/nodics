/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const ExpeditiousCache = require('express-expeditious');
const MemoryEngine = require('expeditious-engine-memory');

module.exports = {
    operations: {
        get: function(app, routerDef) {
            if (routerDef.cache) {
                if (!routerDef.apiCache.engine) {
                    routerDef.apiCache.engine = new MemoryEngine();
                }
                //console.log('Cache configuration : ', routerDef.apiCache, '  :  ', routerDef.url);
                let cache = new ExpeditiousCache(routerDef.apiCache);
                app.route(routerDef.url).get(cache, (req, res) => {
                    SERVICE.RequestHandlerProcessService.startRequestHandlerProcess(req, res, routerDef);
                });
            } else {
                app.route(routerDef.url).get((req, res) => {
                    SERVICE.RequestHandlerProcessService.startRequestHandlerProcess(req, res, routerDef);
                });
            }
        },
        post: function(app, routerDef) {
            if (routerDef.cache) {
                if (!routerDef.apiCache.engine) {
                    routerDef.apiCache.engine = new MemoryEngine();
                }
                //console.log('Cache configuration : ', routerDef.apiCache, '  :  ', routerDef.url);
                let cache = new ExpeditiousCache(routerDef.apiCache);
                app.route(routerDef.url).post(cache, (req, res) => {
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
        /*
            options: {
                apiCache: {
                    // Namespace used to prevent cache conflicts, must be alphanumeric
                    namespace: 'expresscache',
                    // Store cache entries for 1 minute (can also pass milliseconds e.g 60000)
                    defaultTtl: '2 minute'
                }
            },
        */
        commonGetterOperation: {
            /*
                options: {
                    apiCache: {
                        // Namespace used to prevent cache conflicts, must be alphanumeric
                        namespace: 'expresscache',
                        // Store cache entries for 1 minute (can also pass milliseconds e.g 60000)
                        defaultTtl: '3 minute'
                    }
                },
            */
            getModel: {
                secured: true,
                cache: true,
                key: '/schemaName',
                method: 'GET',
                controller: 'CONTROLLER.controllerName.get'
            },
            postModel: {
                secured: true,
                cache: true,
                key: '/schemaName',
                method: 'POST',
                controller: 'CONTROLLER.controllerName.get'
            },
            getById: {
                secured: true,
                cache: true,
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
                secured: true,
                key: '/schemaName',
                method: 'PUT',
                controller: 'CONTROLLER.controllerName.save'
            }
        },
        commonUpdateOperations: {
            saveModels: {
                secured: true,
                key: '/schemaName/update',
                method: 'PUT',
                controller: 'CONTROLLER.controllerName.update'
            }
        },

        commonSaveOrUpdateOperations: {
            saveModels: {
                secured: true,
                key: '/schemaName/saveOrUpdate',
                method: 'PUT',
                controller: 'CONTROLLER.controllerName.saveOrUpdate'
            }
        }
    }
};