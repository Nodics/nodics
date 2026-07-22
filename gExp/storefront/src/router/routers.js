/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module storefront/src/router/routers
 * @description Router definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
const human = function (key, method, permission, operation) {
    return {
        secured: true,
        authTokenTypes: ['access'],
        accessGroups: ['userGroup'],
        permission: permission,
        apiExposure: 'storefrontManagement',
        key: key,
        method: method,
        controller: 'DefaultStorefrontManagementController',
        operation: operation,
        responses: { 200: { description: 'Successful enterprise-scoped Storefront operation' } }
    };
};
module.exports = {
    storefront: {
        context: {
            resolve: {
                secured: false,
                publicAccess: true,
                accessGroups: ['userGroup'],
                apiExposure: 'storefrontDelivery',
                key: '/context/resolve',
                method: 'GET',
                controller: 'DefaultStorefrontContextController',
                operation: 'resolve',
                cache: { enabled: false },
                responses: { 200: { description: 'Resolved active Storefront context for the request hostname' } }
            }
        },
        management: {
            list: human('/management/:resource', 'GET', 'storefront.backoffice.read', 'list'),
            get: human('/management/:resource/:businessCode', 'GET', 'storefront.backoffice.read', 'get'),
            create: human('/management/:resource', 'POST', 'storefront.backoffice.manage', 'create'),
            update: human('/management/:resource/:businessCode', 'PATCH', 'storefront.backoffice.manage', 'update'),
            retire: human(
                '/management/:resource/:businessCode/retire',
                'POST',
                'storefront.backoffice.manage',
                'retire'
            )
        }
    }
};
