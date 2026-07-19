/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module backoffice/src/router/routers
 * @description Router definition registry for this boundary.
 * @layer definition
 * @owner backoffice
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
    backoffice: {
        registryControl: {
            register: {
                secured: true,
                accessGroups: ['userGroup'],
                permissionConfig: 'authSecurity.internalToken.routePermission',
                apiExposure: 'serviceRegistry',
                key: '/registry/instances',
                method: 'PUT',
                controller: 'DefaultBackofficeRegistryController',
                operation: 'register'
            },
            deregister: {
                secured: true,
                accessGroups: ['userGroup'],
                permissionConfig: 'authSecurity.internalToken.routePermission',
                apiExposure: 'serviceRegistry',
                key: '/registry/instances/:instanceId',
                method: 'DELETE',
                controller: 'DefaultBackofficeRegistryController',
                operation: 'deregister'
            }
        },
        registryDiscovery: {
            list: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'backoffice.registry.view',
                apiExposure: 'serviceRegistry',
                key: '/registry/modules',
                method: 'GET',
                controller: 'DefaultBackofficeRegistryController',
                operation: 'list'
            },
            diagnostics: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'backoffice.registry.diagnostics.view',
                apiExposure: 'serviceRegistry',
                key: '/registry/diagnostics',
                method: 'GET',
                controller: 'DefaultBackofficeRegistryController',
                operation: 'diagnostics'
            }
        }
    }
};
