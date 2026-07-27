/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');

const properties = require('../config/properties');

const navigation = properties.backofficeCapabilities.backoffice.navigation;
const documentation = navigation.find(item => item.id === 'documentation');
const sources = properties.backofficeCapabilities.backoffice.documentation;

assert(documentation, 'BackOffice must contribute the documentation navigation entry');
assert.strictEqual(documentation.label, 'Nodics Documentation');
assert.strictEqual(documentation.route, '/docs');
assert.strictEqual(documentation.group.id, 'documentation');
assert.strictEqual(documentation.group.label, 'Documentation');
assert.strictEqual(documentation.group.order, 650);
assert.strictEqual(documentation.featureState, 'ACTIVE');
assert.deepStrictEqual(documentation.contexts, ['environment', 'tenant', 'enterprise']);
assert.strictEqual(documentation.requiredPermissions, undefined,
    'authenticated employees must not require an unrelated operational permission to read help');
assert.deepStrictEqual(sources.map(source => source.id), ['framework', 'swaggers', 'nodics-axis']);
assert(sources.every(source => source.connectionModule),
    'every documentation source must resolve its runtime through the BackOffice registry');
assert.strictEqual(sources.find(source => source.id === 'nodics-axis').packCode, 'axisDocumentation');

console.log('BackOffice documentation navigation contract tests passed');
