/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** Validates consolidated and modular Units conversion access, service headers, response boundaries, and fail-closed behavior. */
const assert = require('assert');
const inventory = require('../config/properties').inventory;
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
global.CLASSES = { NodicsError };
global.CONFIG = { get: key => key === 'inventory' ? inventory : key === 'defaultContentType' ? 'application/json' : undefined };
global.SERVICE = {};
global.NODICS = { getInternalAuthToken: tenant => tenant === 'tenantA' ? 'service-token' : undefined };
const provider = require('../src/service/reference/defaultInventoryUnitsReferenceProviderService');
const request = { tenant: 'tenantA', enterpriseCode: 'enterpriseA', authData: { enterprise: { code: 'enterpriseA' } } };
const input = { quantity: '1000', fromUnitCode: 'G', toUnitCode: 'KG', targetScale: 3, roundingMode: 'UNNECESSARY' };
const result = { quantity: '1.000', fromUnit: { unitCode: 'G', dimensionVector: { MASS: 1 } },
    toUnit: { unitCode: 'KG', dimensionVector: { MASS: 1 } }, conversion: { conversionCode: 'G_TO_KG' } };

(async () => {
    SERVICE.DefaultUnitsReferenceService = { convertInternal: async () => result };
    assert.strictEqual((await provider.convert(request, input)).quantity, '1.000');

    SERVICE.DefaultUnitsReferenceService = undefined;
    let captured;
    SERVICE.DefaultModuleService = { buildRequest: options => { captured = options; return options; }, fetch: async () => ({ data: result }) };
    assert.strictEqual((await provider.convert(request, input)).quantity, '1.000');
    assert.strictEqual(captured.moduleName, 'units');
    assert.strictEqual(captured.apiName, '/references/units/convert');
    assert.strictEqual(captured.header.Authorization, 'Bearer service-token');
    assert.strictEqual(captured.header['x-enterprise-code'], 'enterpriseA');
    assert.deepStrictEqual(captured.requestBody, input);

    SERVICE.DefaultModuleService.fetch = async () => ({ data: Object.assign({}, result, { toUnit: { unitCode: 'L', dimensionVector: { VOLUME: 1 } } }) });
    await assert.rejects(provider.convert(request, input), error => error.code === 'ERR_INV_00011');
    SERVICE.DefaultModuleService.fetch = async () => { throw new Error('timeout'); };
    await assert.rejects(provider.convert(request, input), error => error.code === 'ERR_INV_00011');
    NODICS.getInternalAuthToken = () => undefined;
    await assert.rejects(provider.convert(request, input), error => error.code === 'ERR_INV_00011');
    console.log('Inventory Units reference provider validated');
})().catch(error => { console.error(error); process.exit(1); });
