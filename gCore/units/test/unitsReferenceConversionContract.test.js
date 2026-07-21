/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** Validates secure exact conversion routing, scope selection, direct/reverse factors, dimensions, and fail-closed boundaries. */
const assert = require('assert');
const route = require('../src/router/routers').units.referenceConversion.convert;
const unitsPolicy = require('../config/properties').units;
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
global.CLASSES = { NodicsError };
global.CONFIG = { get: key => key === 'units' ? unitsPolicy : undefined };
global.SERVICE = {};
SERVICE.DefaultUnitsDefinitionService = require('../src/service/foundation/defaultUnitsDefinitionService');
SERVICE.DefaultUnitsConversionPolicyService = require('../src/service/conversion/defaultUnitsConversionPolicyService');
SERVICE.DefaultExactUnitsService = require('../src/service/exact/defaultExactUnitsService');
const reference = require('../src/service/reference/defaultUnitsReferenceService');

const unitDefinitions = [
    { unitCode: 'KG', status: 'ACTIVE', scopeType: 'GLOBAL', dimensionCode: 'MASS', dimensionVector: { MASS: 1 }, precisionScale: 3, roundingMode: 'UNNECESSARY' },
    { unitCode: 'KG', status: 'ACTIVE', scopeType: 'ENTERPRISE', enterpriseCode: 'enterpriseA', dimensionCode: 'MASS', dimensionVector: { MASS: 1 }, precisionScale: 3, roundingMode: 'UNNECESSARY' },
    { unitCode: 'G', status: 'ACTIVE', scopeType: 'GLOBAL', dimensionCode: 'MASS', dimensionVector: { MASS: 1 }, precisionScale: 0, roundingMode: 'UNNECESSARY' },
    { unitCode: 'L', status: 'ACTIVE', scopeType: 'GLOBAL', dimensionCode: 'VOLUME', dimensionVector: { VOLUME: 1 }, precisionScale: 3, roundingMode: 'UNNECESSARY' }
];
const conversions = [{ conversionCode: 'G_TO_KG', fromUnitCode: 'G', toUnitCode: 'KG', numerator: '1', denominator: '1000',
    status: 'ACTIVE', scopeType: 'GLOBAL', geographicScopeLevel: 'GLOBAL' },
{ conversionCode: 'ENT_G_TO_KG', fromUnitCode: 'G', toUnitCode: 'KG', numerator: '1', denominator: '1000',
    status: 'ACTIVE', scopeType: 'ENTERPRISE', enterpriseCode: 'enterpriseA', geographicScopeLevel: 'GLOBAL' }];
const matches = (item, query) => Object.keys(query || {}).every(key => item[key] === query[key]);
SERVICE.DefaultUnitOfMeasureService = { get: async request => ({ result: unitDefinitions.filter(item => matches(item, request.query)) }) };
SERVICE.DefaultUnitConversionService = { get: async request => ({ result: conversions.filter(item => matches(item, request.query)) }) };

assert.strictEqual(route.secured, true);
assert.strictEqual(route.permissionConfig, 'authSecurity.internalToken.routePermission');
assert.strictEqual(route.apiExposure, 'moduleInternal');
assert.strictEqual(route.key, '/references/units/convert');
assert.strictEqual(route.method, 'POST');

const serviceAuth = { tokenType: 'service', entCode: 'enterpriseA' };
(async () => {
    let direct = await reference.convert({ tenant: 'tenantA', authData: serviceAuth,
        body: { quantity: '1250', fromUnitCode: 'G', toUnitCode: 'KG', targetScale: 3, roundingMode: 'UNNECESSARY' } });
    assert.strictEqual(direct.code, 'SUC_UNIT_00001');
    assert.strictEqual(direct.data.quantity, '1.250');
    assert.strictEqual(direct.data.conversion.conversionCode, 'ENT_G_TO_KG');
    assert.strictEqual(direct.data.conversion.reversed, false);
    assert.strictEqual(direct.data.toUnit.scopeType, 'ENTERPRISE');

    let globalFallback = await reference.convertInternal({ tenant: 'tenantA', authData: { tokenType: 'service', entCode: 'enterpriseB' },
        body: { quantity: '1000', fromUnitCode: 'G', toUnitCode: 'KG', targetScale: 3, roundingMode: 'UNNECESSARY' } });
    assert.strictEqual(globalFallback.conversion.conversionCode, 'G_TO_KG');
    assert.strictEqual(globalFallback.toUnit.scopeType, 'GLOBAL');

    let reverse = await reference.convertInternal({ tenant: 'tenantA', authData: serviceAuth,
        body: { quantity: '1.250', fromUnitCode: 'KG', toUnitCode: 'G', targetScale: 0, roundingMode: 'UNNECESSARY' } });
    assert.strictEqual(reverse.quantity, '1250');
    assert.strictEqual(reverse.conversion.reversed, true);

    let same = await reference.convertInternal({ tenant: 'tenantA', authData: serviceAuth,
        body: { quantity: '1', fromUnitCode: 'KG', toUnitCode: 'KG', targetScale: 3, roundingMode: 'UNNECESSARY' } });
    assert.strictEqual(same.quantity, '1.000'); assert.strictEqual(same.conversion, null);

    await assert.rejects(reference.convertInternal({ tenant: 'tenantA', authData: serviceAuth,
        body: { quantity: '1', fromUnitCode: 'L', toUnitCode: 'KG', targetScale: 3 } }), error => error.code === 'ERR_UNIT_00003');
    await assert.rejects(reference.convert({ tenant: 'tenantA', authData: { tokenType: 'access', entCode: 'enterpriseA' },
        body: { quantity: '1', fromUnitCode: 'KG', toUnitCode: 'KG', targetScale: 3 } }), error => error.code === 'ERR_UNIT_00007');
    await assert.rejects(reference.convertInternal({ tenant: 'tenantA', authData: serviceAuth,
        body: { quantity: '1', fromUnitCode: 'KG', toUnitCode: 'KG', targetScale: 3, roundingMode: 'UNKNOWN' } }),
    error => error.code === 'ERR_UNIT_00001');
    console.log('Units reference conversion contract validated');
})().catch(error => { console.error(error); process.exit(1); });
