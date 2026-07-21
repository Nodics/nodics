/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module inventory/service/sourcing/DefaultStockSourcingIntentService
 * @description Secures and bounds the module-to-module Stock Sourcing evaluation contract without exposing persistence or availability.
 * @layer service
 * @owner inventory
 * @override Projects may tighten bounds or decorate diagnostics while preserving service identity, enterprise isolation, and safe projection.
 */
module.exports = {
    /** Initializes the sourcing intent service. */ init: function () { return Promise.resolve(true); },
    /** Completes sourcing intent initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Returns effective sourcing intent policy. */ policy: function () { return ((CONFIG.get('inventory') || {}).stockSourcingIntent) || {}; },
    /** Requires the existing internal service-token identity boundary. */
    validateServiceIdentity: function (request) {
        if (this.policy().requireServiceToken !== false && (!request.authData || request.authData.tokenType !== 'service')) {
            throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00026', 'Stock sourcing intent requires an internal service identity');
        }
        return true;
    },
    /** Validates request shape and configured size/cardinality boundaries before evaluation. */
    validateBody: function (body) {
        let policy = this.policy(); let keys = body && body.context && typeof body.context === 'object' && !Array.isArray(body.context) ? Object.keys(body.context) : [];
        let allowedKeys = ((((CONFIG.get('inventory') || {}).stockSourcing) || {}).contextKeys) || [];
        let bytes;
        try { bytes = Buffer.byteLength(JSON.stringify(body || {}), 'utf8'); } catch (error) { bytes = Number.MAX_SAFE_INTEGER; }
        let invalidValue = keys.some(key => {
            let values = Array.isArray(body.context[key]) ? body.context[key] : [body.context[key]];
            return !values.length || values.length > Number(policy.maximumValuesPerKey || 50) || values.some(value =>
                !['string', 'number', 'boolean'].includes(typeof value) || String(value).length > Number(policy.maximumValueLength || 256));
        });
        if (!body || !body.context || Array.isArray(body.context) || keys.some(key => !allowedKeys.includes(key) || key.startsWith('$')) ||
            keys.length > Number(policy.maximumContextKeys || 16) ||
            bytes > Number(policy.maximumRequestBytes || 16384) || invalidValue ||
            (body.at !== undefined && !Number.isFinite(new Date(body.at).getTime())) || Object.keys(body).some(key => !['context', 'at'].includes(key))) {
            throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00027', 'Stock sourcing intent request is invalid or exceeds configured bounds');
        }
        return true;
    },
    /** Returns only ordered Pool and matched Rule identifiers plus evaluation/correlation evidence. */
    evaluate: async function (request) {
        this.validateServiceIdentity(request || {}); this.validateBody(request && request.body);
        let enterpriseCode = SERVICE.DefaultInventoryEnterpriseScopeService.resolveEnterpriseCode(request);
        let result = await SERVICE.DefaultStockSourcingCacheService.evaluate({ tenant: request.tenant, authData: request.authData,
            context: request.body.context, at: request.body.at });
        if (!result || result.enterpriseCode !== enterpriseCode || !Array.isArray(result.poolCodes) || !Array.isArray(result.matchedRuleCodes)) {
            throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00002', 'Stock sourcing result violated authenticated enterprise scope');
        }
        let maximum = Number(this.policy().maximumResultCount || 100);
        if (result.poolCodes.length > maximum || result.matchedRuleCodes.length > maximum) {
            throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00028', 'Stock sourcing intent result exceeds the configured safe boundary');
        }
        return { code: 'SUC_INV_00002', data: { enterpriseCode: result.enterpriseCode, poolCodes: result.poolCodes.slice(),
            matchedRuleCodes: result.matchedRuleCodes.slice(), evaluatedAt: result.evaluatedAt,
            correlationId: typeof request.correlationId === 'string' ? request.correlationId : undefined } };
    }
};
