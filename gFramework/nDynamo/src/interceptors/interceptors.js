/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
