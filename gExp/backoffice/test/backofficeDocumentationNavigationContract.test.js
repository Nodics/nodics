/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');

const properties = require('../config/properties');

const navigation = properties.backofficeCapabilities.backoffice.navigation;
const documentation = navigation.find(item => item.id === 'documentation');
const documentationLinks = navigation.filter(item => item.parentId === 'documentation');
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
assert.deepStrictEqual(documentationLinks.map(item => item.id), [
    'documentation-framework',
    'documentation-swaggers',
    'documentation-nodics-axis'
]);
assert.deepStrictEqual(documentationLinks.map(item => item.label), ['Framework', 'Swaggers', 'Nodics Axis']);
assert.deepStrictEqual(documentationLinks.map(item => item.route), [
    '/docs/framework',
    '/docs/swaggers',
    '/docs/nodics-axis'
]);
assert(documentationLinks.every(item => item.group.id === 'documentation'),
    'documentation child links must remain grouped under the documentation navigation area');
assert(documentationLinks.every(item => item.contexts.join('|') === 'environment|tenant|enterprise'),
    'documentation child links must keep the same context boundary as the documentation landing');
assert(documentationLinks.every(item => item.featureState === 'ACTIVE'),
    'documentation child links must be active direct destinations');
assert.deepStrictEqual(sources.map(source => source.id), ['framework', 'swaggers', 'nodics-axis']);
assert(sources.every(source => source.connectionModule),
    'every documentation source must resolve its runtime through the BackOffice registry');
assert.strictEqual(sources.find(source => source.id === 'nodics-axis').packCode, 'axisDocumentation');
assert(sources.every(source => source.dashboard && source.dashboard.summary),
    'every documentation source must provide dashboard summary metadata');
assert.deepStrictEqual(sources.map(source => source.dashboard.coverage.score), [85, 100, 45]);
assert.deepStrictEqual(sources.map(source => source.dashboard.coverage.status), ['STRONG', 'REFERENCE', 'PARTIAL']);
assert(sources.every(source => Array.isArray(source.dashboard.coverage.gaps)),
    'documentation dashboard coverage must expose bounded gap lists for the landing dashboard');

console.log('BackOffice documentation navigation contract tests passed');
