/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module product/router/routers @description Defines human Product management and service-token Product reference intents. @layer router @owner product */
const human = function (key, method, permission, operation, controller) { return { secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'], permission: permission, apiExposure: 'productManagement', key: key, method: method, controller: controller || 'DefaultProductManagementController', operation: operation, responses: { '200': { description: 'Successful enterprise-scoped Product operation' } } }; };
module.exports = { product: {
    management: {
        list: human('/management/:resource', 'GET', 'product.backoffice.read', 'list'),
        get: human('/management/:resource/:businessCode', 'GET', 'product.backoffice.read', 'get'),
        create: human('/management/:resource', 'POST', 'product.backoffice.manage', 'create'),
        update: human('/management/:resource/:businessCode', 'PATCH', 'product.backoffice.manage', 'update'),
        retire: human('/management/:resource/:businessCode/retire', 'POST', 'product.backoffice.manage', 'retire'),
        submitPublication: human('/management/publications/submit', 'POST', 'product.backoffice.manage', 'submitPublication')
    },
    itemReference: {
        resolve: { secured: true, accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'moduleInternal', key: '/references/items/resolve', method: 'POST', controller: 'DefaultProductItemReferenceController', operation: 'resolve', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', additionalProperties: false, required: ['catalogCode', 'itemType', 'itemCode'], properties: { catalogCode: { type: 'string' }, itemType: { type: 'string' }, itemCode: { type: 'string' } } } } } }, responses: { '200': { description: 'Bounded Product Item reference result' } } }
    },
    online: {
        readItem: { secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'], permission: 'product.online.read', apiExposure: 'productDelivery', key: '/online/items/:itemType/:itemCode', method: 'GET', controller: 'DefaultProductOnlineReadController', operation: 'readItem', responses: { '200': { description: 'Active-release Product projection' } } }
    },
    operations: {
        diagnostics: human('/operations/publication/:catalogCode', 'GET', 'product.operations.read', 'diagnostics', 'DefaultProductOperationsController'),
        reconcile: human('/operations/publication/:catalogCode/reconcile', 'POST', 'product.operations.manage', 'reconcile', 'DefaultProductOperationsController')
    },
    publicationTarget: {
        deploy: { secured: true, accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'moduleInternal', key: '/publication/target/deploy', method: 'POST', controller: 'DefaultProductPublicationTargetController', operation: 'deploy' },
        status: { secured: true, accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'moduleInternal', key: '/publication/target/status', method: 'POST', controller: 'DefaultProductPublicationTargetController', operation: 'status' },
        rollback: { secured: true, accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'moduleInternal', key: '/publication/target/rollback', method: 'POST', controller: 'DefaultProductPublicationTargetController', operation: 'rollback' }
    }
} };
