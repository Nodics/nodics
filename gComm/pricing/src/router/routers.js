/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module pricing/router/routers @description Narrow service-token-only Pricing intent and publication target routes. @layer router @owner pricing */
const internal = function (key, controller, operation) { return { secured: true, accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'moduleInternal', key: key, method: 'POST', controller: controller, operation: operation, responses: { '200': { description: 'Successful bounded Pricing operation' } } }; };
const human = function (key, method, permission, operation) { return { secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'], permission: permission, apiExposure: 'pricingManagement', key: key, method: method, controller: 'DefaultPricingManagementController', operation: operation, responses: { '200': { description: 'Successful tenant- and enterprise-scoped Pricing management operation' } } }; };
module.exports = {
    pricing: {
        management: {
            validate: human('/management/preview/validate', 'POST', 'pricing.backoffice.preview', 'validate'),
            conflicts: human('/management/preview/conflicts', 'POST', 'pricing.backoffice.preview', 'conflicts'),
            simulate: human('/management/preview/simulate', 'POST', 'pricing.backoffice.preview', 'simulate'),
            submitPublication: human('/management/publications/submit', 'POST', 'pricing.backoffice.manage', 'submitPublication'),
            list: human('/management/:resource', 'GET', 'pricing.backoffice.read', 'list'),
            get: human('/management/:resource/:businessCode', 'GET', 'pricing.backoffice.read', 'get'),
            create: human('/management/:resource', 'POST', 'pricing.backoffice.manage', 'create'),
            update: human('/management/:resource/:businessCode', 'PATCH', 'pricing.backoffice.manage', 'update'),
            retire: human('/management/:resource/:businessCode/retire', 'POST', 'pricing.backoffice.manage', 'retire')
        },
        priceResolution: {
            resolve: Object.assign(internal('/references/prices/resolve', 'DefaultPriceResolutionController', 'resolve'), {
                requestBody: { required: true, content: { 'application/json': { schema: {
                    type: 'object', additionalProperties: false,
                    required: ['item', 'quantity', 'unitCode', 'currencyCode'],
                    properties: {
                        item: { type: 'object', additionalProperties: false, required: ['itemType', 'itemCode'],
                            properties: { itemType: { type: 'string' }, itemCode: { type: 'string' } } },
                        quantity: { type: 'string' }, unitCode: { type: 'string' },
                        currencyCode: { type: 'string', minLength: 3, maxLength: 3 },
                        context: { type: 'object' }, at: { type: 'string', format: 'date-time' }
                    }
                } } } }
            }),
            resolveStorefront: {
                secured: false, publicAccess: true, accessGroups: ['userGroup'], apiExposure: 'pricingDelivery',
                key: '/delivery/storefront/prices/resolve', method: 'POST', controller: 'DefaultPriceResolutionController', operation: 'resolveStorefront',
                cache: { enabled: false },
                help: { requestType: 'public', message: 'Resolve one exact Online Price using an opaque Storefront context.',
                    parameters: [{ name: 'x-nodics-storefront-context', in: 'header', required: true,
                        description: 'Opaque short-lived context handle issued by Storefront.', schema: { type: 'string' } }] },
                requestBody: { required: true, content: { 'application/json': { schema: {
                    type: 'object', additionalProperties: false, required: ['item', 'quantity', 'unitCode'],
                    properties: {
                        item: { type: 'object', additionalProperties: false, required: ['itemType', 'itemCode'],
                            properties: { itemType: { type: 'string' }, itemCode: { type: 'string' } } },
                        quantity: { type: 'string' }, unitCode: { type: 'string' }, at: { type: 'string', format: 'date-time' }
                    }
                } } } },
                responses: { '200': { description: 'Storefront-bound exact Online Price' },
                    '401': { description: 'Storefront context is missing, inactive, expired, or unavailable' },
                    '404': { description: 'Applicable Online Price is unavailable' } }
            }
        },
        publicationTarget: {
            deploy: internal('/publication/target/deploy', 'DefaultPricingPublicationTargetController', 'deploy'),
            status: internal('/publication/target/status', 'DefaultPricingPublicationTargetController', 'status'),
            rollback: internal('/publication/target/rollback', 'DefaultPricingPublicationTargetController', 'rollback')
        }
    }
};
