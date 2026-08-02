/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module database/test/schemaWorkbenchRouterContract
 * @description Verifies that Schema Workbench discovery routes remain secured,
 * permissioned, exposure-governed, and metadata-only.
 * @layer test
 * @owner nDatabase
 * @override Later layers may add stricter route policy while retaining these
 * minimum security requirements.
 */

const assert = require('assert');
const routers = require('../src/router/routers');

const routes = routers.common.schemaWorkbench;
['listSchemas', 'getSchema', 'searchRecords', 'previewDeleteImpact'].forEach(routeName => {
    let route = routes[routeName];
    assert.strictEqual(route.secured, true);
    assert.strictEqual(route.permission, 'system.schema.workbench.view');
    assert.strictEqual(route.apiExposure, 'schemaWorkbench');
    assert.strictEqual(route.controller, 'DefaultSchemaWorkbenchController');
});
assert.strictEqual(routes.listSchemas.method, 'GET');
assert.strictEqual(routes.getSchema.key, '/schema/workbench/:schema');
assert.strictEqual(routes.searchRecords.method, 'POST');
assert.strictEqual(routes.searchRecords.key, '/schema/workbench/:schema/records');
['deleteRecord', 'bulkRecords', 'aggregateOperation'].forEach(routeName => {
    let route = routes[routeName];
    assert.strictEqual(route.secured, true);
    assert.strictEqual(route.permission, 'system.schema.workbench.manage');
    assert.strictEqual(route.apiExposure, 'schemaWorkbench');
    assert.strictEqual(route.controller, 'DefaultSchemaWorkbenchController');
});
assert.strictEqual(routes.deleteRecord.method, 'DELETE');
assert.strictEqual(routes.deleteRecord.key, '/schema/workbench/:schema/record');
assert.strictEqual(routes.bulkRecords.method, 'POST');
assert.strictEqual(routes.aggregateOperation.method, 'POST');

console.log('Schema Workbench router security contract validated');
