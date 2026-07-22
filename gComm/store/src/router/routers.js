/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module store/src/router/routers @description Defines bounded human Store management and service-token Store reference intents. @layer router @owner store @override Later modules may replace routes while preserving authentication, permission, and authority boundaries. */
const human = function (key, method, permission, operation) { return { secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'], permission: permission, apiExposure: 'storeManagement', key: key, method: method, controller: 'DefaultStoreManagementController', operation: operation, responses: { '200': { description: 'Successful enterprise-scoped Store operation' } } }; };
module.exports = { store: {
    management: {
        list: human('/management/:resource', 'GET', 'store.backoffice.read', 'list'),
        get: human('/management/:resource/:businessCode', 'GET', 'store.backoffice.read', 'get'),
        create: human('/management/:resource', 'POST', 'store.backoffice.manage', 'create'),
        update: human('/management/:resource/:businessCode', 'PATCH', 'store.backoffice.manage', 'update'),
        retire: human('/management/:resource/:businessCode/retire', 'POST', 'store.backoffice.manage', 'retire')
    },
    reference: {
        resolve: { secured: true, authTokenTypes: ['service'], accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'moduleInternal', key: '/references/stores/resolve', method: 'POST', controller: 'DefaultStoreReferenceController', operation: 'resolve', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', additionalProperties: false, required: ['storeCode'], properties: { storeCode: { type: 'string' } } } } } }, responses: { '200': { description: 'Bounded active Store reference' } } }
    }
} };
