/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module units/test/unitsFoundationContract
 * @description Validates Units schemas, persistence boundaries, enterprise scope, land units, lifecycle, and configuration customization.
 * @layer test
 * @owner units
 * @override Projects may extend definitions and policies through later layers without exposing generated CRUD or copying Units authority.
 */
const assert = require('assert');
const properties = require('../config/properties').units;
const schemas = require('../src/schemas/schemas').units;
const interceptors = require('../src/interceptors/interceptors');
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
global.CLASSES = { NodicsError };
global.CONFIG = { get: key => key === 'units' ? properties : undefined };
const definitions = require('../src/service/foundation/defaultUnitsDefinitionService');

['unitDimension', 'unitOfMeasure', 'unitConversion'].forEach(name => {
    assert.strictEqual(schemas[name].super, 'base'); assert.strictEqual(schemas[name].router.enabled, false);
});
['dimensionPreSave', 'dimensionPreRemove', 'unitPreSave', 'unitPreRemove', 'conversionPreSave', 'conversionPreRemove']
    .forEach(name => assert(interceptors[name]));

(async () => {
    let area = { model: { dimensionCode: 'AREA', name: 'Area', dimensionVector: { LENGTH: 2 } } };
    await definitions.prepareDimensionSave(area);
    assert.strictEqual(area.model.code, 'GLOBAL::global::dimension::AREA');
    let bigha = { authData: { entCode: 'farmEnterprise' }, model: { scopeType: 'ENTERPRISE', unitCode: 'BIGHA_UP',
        name: 'Bigha UP', dimensionCode: 'AREA', dimensionVector: { LENGTH: 2 }, precisionScale: 6, roundingMode: 'HALF_EVEN' } };
    await definitions.prepareUnitSave(bigha);
    assert.strictEqual(bigha.model.enterpriseCode, 'farmEnterprise');
    let scoped = { model: { conversionCode: 'BIGHA_UP_TO_SQM', fromUnitCode: 'BIGHA_UP', toUnitCode: 'M2',
        numerator: '250000', denominator: '1', geographicScopeLevel: 'SUBDIVISION', countryCode: 'IN', subdivisionCode: 'UP' } };
    await definitions.prepareConversionSave(scoped);
    assert.throws(() => definitions.prepareConversionSave({ model: { conversionCode: 'BAD', fromUnitCode: 'BIGHA', toUnitCode: 'M2',
        numerator: '1', denominator: '0', geographicScopeLevel: 'GLOBAL' } }), error => error.code === 'ERR_UNIT_00001');
    assert.throws(() => definitions.prepareConversionSave({ model: { conversionCode: 'BAD_REGION', fromUnitCode: 'BIGHA', toUnitCode: 'M2',
        numerator: '1', denominator: '1', geographicScopeLevel: 'LOCALITY', countryCode: 'IN' } }), error => error.code === 'ERR_UNIT_00004');
    properties.unitKinds.push('LOGARITHMIC');
    let custom = { model: { unitCode: 'CUSTOM', name: 'Custom', dimensionCode: 'COUNT', dimensionVector: { COUNT: 1 },
        kind: 'LOGARITHMIC', precisionScale: 2, roundingMode: 'HALF_UP' } };
    await definitions.prepareUnitSave(custom); properties.unitKinds.pop();
    await assert.rejects(definitions.rejectHardDelete(), error => error.code === 'ERR_UNIT_00006');
    console.log('Units foundation contract validated');
})().catch(error => { console.error(error); process.exit(1); });
