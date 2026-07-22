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
const contracts = require('../schemas/apiContracts');
const errorResponse = description => ({ description: description, content: { 'application/json': { schema: contracts.errorEnvelope } } });
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
        responses: { 200: { description: 'Successful enterprise-scoped Storefront operation' },
            400: errorResponse('Invalid Storefront request'), 401: errorResponse('Human authentication required'),
            403: errorResponse('Permission denied') }
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
                help: { parameters: [{ name: 'x-nodics-client-contract-version', in: 'header', required: false,
                    description: 'Positive Storefront client major version; defaults to the configured minimum.',
                    schema: { type: 'integer', minimum: 1 } }, { name: 'If-None-Match', in: 'header', required: false,
                    description: 'Weak ETag returned by an earlier response.', schema: { type: 'string' } }] },
                responses: {
                    200: { description: 'Resolved active Storefront context for the trusted request hostname',
                        headers: { ETag: { schema: { type: 'string' } }, 'Cache-Control': { schema: { type: 'string' } },
                            'x-nodics-storefront-contract-version': { schema: { type: 'integer' } }, 'x-request-id': { schema: { type: 'string' } } },
                        content: { 'application/json': { schema: contracts.successEnvelope(contracts.contextData) } } },
                    304: { description: 'Client context ETag is still current' },
                    400: errorResponse('Hostname or contract-version request is invalid'),
                    404: errorResponse('Active Storefront context was not found'),
                    426: errorResponse('Client contract version is no longer supported'),
                    429: Object.assign(errorResponse('HTTP rate limit exceeded'), { headers: { 'Retry-After': { schema: { type: 'integer' } } } }),
                    503: Object.assign(errorResponse('Storefront resolution capacity is temporarily unavailable'), { headers: { 'Retry-After': { schema: { type: 'integer' } } } })
                }
            },
            introspect: {
                secured: true, authTokenTypes: ['service'], accessGroups: ['userGroup'],
                permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'moduleInternal',
                key: '/context/introspect', method: 'POST', controller: 'DefaultStorefrontContextController', operation: 'introspect',
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', additionalProperties: false,
                    required: ['handle', 'audience'], properties: { handle: { type: 'string' }, binding: { type: 'string' },
                        audience: { enum: ['cms', 'product', 'pricing', 'inventory'] } } } } } },
                responses: { 200: { description: 'Audience-bound active-state response for an opaque Storefront context handle' } }
            },
            refresh: {
                secured: false, publicAccess: true, accessGroups: ['userGroup'], apiExposure: 'storefrontDelivery',
                key: '/context/refresh', method: 'POST', controller: 'DefaultStorefrontContextController', operation: 'refresh', cache: { enabled: false },
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', additionalProperties: false,
                    required: ['handle'], properties: { handle: { type: 'string' }, binding: { type: 'string' } } } } } },
                responses: { 200: { description: 'Rotated Storefront context handle; the predecessor is inactive' },
                    400: errorResponse('Active Storefront context handle is required'), 429: errorResponse('HTTP rate limit exceeded') }
            },
            revoke: {
                secured: true, authTokenTypes: ['service'], accessGroups: ['userGroup'],
                permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'moduleInternal',
                key: '/context/revoke', method: 'POST', controller: 'DefaultStorefrontContextController', operation: 'revoke', cache: { enabled: false },
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', additionalProperties: false,
                    required: ['handle'], properties: { handle: { type: 'string' }, reason: { type: 'string', maxLength: 128 } } } } } },
                responses: { 200: { description: 'The Storefront context handle is inactive' }, 401: errorResponse('Module service identity required') }
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
        },
        operations: {
            diagnostics: human('/operations/diagnostics', 'GET', 'storefront.operations.read', 'diagnostics'),
            revokeStorefrontContexts: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'],
                permission: 'storefront.operations.manage', apiExposure: 'storefrontManagement',
                key: '/operations/context-access/revoke-storefront', method: 'POST',
                controller: 'DefaultStorefrontContextController', operation: 'revokeStorefront', cache: { enabled: false },
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', additionalProperties: false,
                    required: ['storefrontCode'], properties: { storefrontCode: { type: 'string' }, reason: { type: 'string', maxLength: 128 } } } } } },
                responses: { 200: { description: 'Every earlier context handle for the Storefront is inactive' },
                    401: errorResponse('Human authentication required'), 403: errorResponse('Permission denied') }
            }
        }
    }
};
module.exports.storefront.operations.diagnostics.responses[200] = {
    description: 'Sanitized Storefront production diagnostics',
    content: { 'application/json': { schema: contracts.successEnvelope(contracts.diagnosticsData) } }
};
