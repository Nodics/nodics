/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nDynamo/src/interceptors/interceptors
 * @description Registers nDynamo interceptor wiring for pipeline extension points.
 * @layer interceptors
 * @owner nDynamo
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {

    postSaveClassConfiguration: {
        type: 'schema',
        item: 'classConfiguration',
        trigger: 'postSave',
        active: 'true',
        index: 0,
        handler: 'DefaultClassConfigurationSaveInterceptorService.removeBody'
    },

    checkModuleSchemaConfiguration: {
        type: 'schema',
        item: 'schemaConfiguration',
        trigger: 'preSave',
        active: 'true',
        index: 0,
        handler: 'DefaultSchemaConfigurationSaveInterceptorService.checkIfModuleActive'
    },

    accessGroupsSchemaConfiguration: {
        type: 'schema',
        item: 'schemaConfiguration',
        trigger: 'preSave',
        active: 'true',
        index: 0,
        handler: 'DefaultSchemaConfigurationSaveInterceptorService.assignDefaultAccessGroup'
    },

    validateTransactionSchemaConfiguration: {
        type: 'schema',
        item: 'schemaConfiguration',
        trigger: 'preSave',
        active: 'true',
        index: 10,
        handler: 'DefaultSchemaConfigurationSaveInterceptorService.validateTransactionConfiguration'
    },

    checkModuleRouterConfiguration: {
        type: 'schema',
        item: 'routerConfiguration',
        trigger: 'preSave',
        active: 'true',
        index: 0,
        handler: 'DefaultRouterConfigurationSaveInterceptorService.checkIfModuleActiveForRouter'
    },

    validateRouterConfiguration: {
        type: 'schema',
        item: 'routerConfiguration',
        trigger: 'preSave',
        active: 'true',
        index: 10,
        handler: 'DefaultRouterConfigurationSaveInterceptorService.validateRouterConfiguration'
    }
};
