/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module units/test/exactUnitsAndRegionalConversion
 * @description Validates exact decimal arithmetic, rounding, compound dimensions, and geographically specific land conversion selection.
 * @layer test
 * @owner units
 * @override Projects may add scoped conversions while preserving exact arithmetic, dimensional compatibility, and ambiguity rejection.
 */
const assert = require('assert');
const properties = require('../config/properties').units;
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
global.CLASSES = { NodicsError };
global.CONFIG = { get: key => key === 'units' ? properties : undefined };
const exact = require('../src/service/exact/defaultExactUnitsService');
const conversion = require('../src/service/conversion/defaultUnitsConversionPolicyService');

assert.strictEqual(exact.multiplyRational('1', '1000', '1', 3, 'UNNECESSARY'), '1000.000');
assert.strictEqual(exact.multiplyRational('2.5', '1', '2', 2, 'HALF_EVEN'), '1.25');
assert.strictEqual(exact.multiplyRational('1', '1', '3', 4, 'HALF_UP'), '0.3333');
assert.strictEqual(exact.multiplyRational('-1.005', '1', '1', 2, 'HALF_UP'), '-1.01');
assert.strictEqual(exact.multiplyRational('1.005', '1', '1', 2, 'HALF_EVEN'), '1.00');
assert.strictEqual(exact.add('0.1', '0.2', 3, 'UNNECESSARY'), '0.300');
assert.throws(() => exact.multiplyRational('0.1', '1', '3', 2, 'UNNECESSARY'), error => error.code === 'ERR_UNIT_00001');
assert.throws(() => exact.multiplyRational(0.1, '1', '1', 2, 'HALF_EVEN'), error => error.code === 'ERR_UNIT_00001');

const area = { dimensionVector: { LENGTH: 2 } };
const hectare = { dimensionVector: { LENGTH: 2 } };
const mass = { dimensionVector: { MASS: 1 } };
assert.strictEqual(conversion.assertCompatible(area, hectare), true);
assert.throws(() => conversion.assertCompatible(area, mass), error => error.code === 'ERR_UNIT_00003');

let conversions = [
    { conversionCode: 'bigha-global', status: 'ACTIVE', geographicScopeLevel: 'GLOBAL', numerator: '1', denominator: '1' },
    { conversionCode: 'bigha-in-up', status: 'ACTIVE', geographicScopeLevel: 'SUBDIVISION', countryCode: 'IN', subdivisionCode: 'UP', numerator: '250000', denominator: '1' },
    { conversionCode: 'bigha-in-wb', status: 'ACTIVE', geographicScopeLevel: 'SUBDIVISION', countryCode: 'IN', subdivisionCode: 'WB', numerator: '133780', denominator: '1' }
];
assert.strictEqual(conversion.select(conversions, { countryCode: 'IN', subdivisionCode: 'UP' }).conversionCode, 'bigha-in-up');
assert.strictEqual(conversion.select(conversions, { countryCode: 'IN', subdivisionCode: 'WB' }).conversionCode, 'bigha-in-wb');
assert.strictEqual(conversion.select(conversions, { countryCode: 'AE' }).conversionCode, 'bigha-global');
conversions.push(Object.assign({}, conversions[1], { conversionCode: 'duplicate-up' }));
assert.throws(() => conversion.select(conversions, { countryCode: 'IN', subdivisionCode: 'UP' }), error => error.code === 'ERR_UNIT_00004');

console.log('Exact Units and regional land conversion validated');
