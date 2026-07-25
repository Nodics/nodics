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

assert(documentation, 'BackOffice must contribute the documentation navigation entry');
assert.strictEqual(documentation.label, 'Help and Documentation');
assert.strictEqual(documentation.route, '/docs');
assert.strictEqual(documentation.group.id, 'workspace');
assert.strictEqual(documentation.featureState, 'ACTIVE');
assert.deepStrictEqual(documentation.contexts, ['environment', 'tenant', 'enterprise']);
assert.strictEqual(documentation.requiredPermissions, undefined,
    'authenticated employees must not require an unrelated operational permission to read help');

console.log('BackOffice documentation navigation contract tests passed');
