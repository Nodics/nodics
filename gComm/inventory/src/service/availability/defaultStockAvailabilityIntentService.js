/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** @module inventory/service/availability/DefaultStockAvailabilityIntentService @description Secures the module-internal ON_HAND availability projection. @layer service @owner inventory */
module.exports = {
    /** Initializes the intent service. */ init: function () { return Promise.resolve(true); },
    /** Completes intent initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Validates the bounded availability request shared by trusted module and Storefront delivery paths. */
    validate: function (request) {
        let body = request.body || {}; if (!body.context || !body.item || Object.keys(body).some(key => !['context', 'item', 'at'].includes(key))) {
            throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00029', 'Stock availability request is invalid');
        }
        return body;
    },
    /** Executes the one authoritative cached availability chain. */
    resolve: async function (request) {
        let body = this.validate(request);
        let evaluator = SERVICE.DefaultStockAvailabilityCacheService || SERVICE.DefaultStockAvailabilityService;
        let result = await evaluator.evaluate({ tenant: request.tenant, authData: request.authData,
            context: body.context, item: body.item, at: body.at });
        return { code: 'SUC_INV_00003', data: result };
    },
    /** Evaluates one service-token-only ON_HAND request with operational evidence. */
    evaluate: async function (request) {
        let policy = ((CONFIG.get('inventory') || {}).stockAvailability) || {};
        if (policy.requireServiceToken !== false && (!request.authData || request.authData.tokenType !== 'service')) {
            throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00031', 'Stock availability requires an internal service identity');
        }
        return this.resolve(request);
    },
    /** Evaluates trusted Storefront scope and returns only customer-safe availability totals. */
    evaluateStorefront: async function (request) {
        if (!request || request._storefrontContextValidated !== true || !request.authData || request.authData.tokenType !== 'storefront_context') {
            throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00052', 'Active Storefront context is required');
        }
        let response = await this.resolve(request), result = response.data || {};
        return { code: response.code, data: { type: result.type, item: result.item, quantity: result.quantity,
            unitCode: result.unitCode, onHandQuantity: result.onHandQuantity, reservedQuantity: result.reservedQuantity,
            availableToSell: result.availableToSell, evaluatedAt: result.evaluatedAt } };
    }
};
