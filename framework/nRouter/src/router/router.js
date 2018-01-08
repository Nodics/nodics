/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    operations: {
        get: function(app, moduleName, routerDef) {
            app.route(routerDef.url).get((req, res) => {
                SERVICE.RequestHandlerService.startRequestHandlerProcess(req, res, routerDef);
            });
        },
        post: function(app, moduleName, routerDef) {
            app.route(routerDef.url).post((req, res) => {
                SERVICE.RequestHandlerService.startRequestHandlerProcess(req, res, routerDef);
            });
        },
        delete: function(app, moduleName, routerDef) {
            app.route(routerDef.url).delete((req, res) => {
                SERVICE.RequestHandlerService.startRequestHandlerProcess(req, res, routerDef);
            });
        },
        put: function(app, moduleName, routerDef) {
            app.route(routerDef.url).put((req, res) => {
                SERVICE.RequestHandlerService.startRequestHandlerProcess(req, res, routerDef);
            });
        }
    },

    default: {
        commonGetterOperation: {
            getModel: {
                secured: true,
                key: '/schemaName',
                method: 'GET',
                controller: 'CONTROLLER.controllerName.get'
            },
            postModel: {
                secured: true,
                key: '/schemaName',
                method: 'POST',
                controller: 'CONTROLLER.controllerName.get'
            },
            getById: {
                secured: true,
                key: '/schemaName/id/:id',
                method: 'GET',
                controller: 'CONTROLLER.controllerName.getById'
            },
            getByCode: {
                secured: true,
                key: '/schemaName/code/:code',
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
            },
            deleteByCode: {
                secured: true,
                key: '/schemaName/code',
                method: 'DELETE',
                controller: 'CONTROLLER.controllerName.removeByCode'
            },
            deleteByCodes: {
                secured: true,
                key: '/schemaName/code/:code',
                method: 'DELETE',
                controller: 'CONTROLLER.controllerName.removeByCode'
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