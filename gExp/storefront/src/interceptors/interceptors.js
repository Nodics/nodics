/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module storefront/src/interceptors/interceptors
 * @description Interceptor definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
    storefrontPreSave: {
        type: 'schema',
        item: 'storefront',
        trigger: 'preSave',
        active: 'true',
        index: -100,
        handler: 'DefaultStorefrontFoundationService.prepareSave'
    },
    storefrontPreGet: {
        type: 'schema',
        item: 'storefront',
        trigger: 'preGet',
        active: 'true',
        index: -100,
        handler: 'DefaultStorefrontEnterpriseScopeService.scopeQuery'
    },
    storefrontPreUpdate: {
        type: 'schema',
        item: 'storefront',
        trigger: 'preUpdate',
        active: 'true',
        index: -100,
        handler: 'DefaultStorefrontFoundationService.prepareUpdate'
    },
    storefrontPreRemove: {
        type: 'schema',
        item: 'storefront',
        trigger: 'preRemove',
        active: 'true',
        index: -100,
        handler: 'DefaultStorefrontFoundationService.rejectHardDelete'
    },
    storefrontEndpointPreSave: {
        type: 'schema',
        item: 'storefrontEndpoint',
        trigger: 'preSave',
        active: 'true',
        index: -100,
        handler: 'DefaultStorefrontEndpointFoundationService.prepareSave'
    },
    storefrontEndpointPreUpdate: {
        type: 'schema',
        item: 'storefrontEndpoint',
        trigger: 'preUpdate',
        active: 'true',
        index: -100,
        handler: 'DefaultStorefrontEndpointFoundationService.prepareUpdate'
    },
    storefrontEndpointPreRemove: {
        type: 'schema',
        item: 'storefrontEndpoint',
        trigger: 'preRemove',
        active: 'true',
        index: -100,
        handler: 'DefaultStorefrontEndpointFoundationService.rejectHardDelete'
    }
};
