/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
['bulkRecords', 'aggregateOperation'].forEach(routeName => {
    let route = routes[routeName];
    assert.strictEqual(route.secured, true);
    assert.strictEqual(route.permission, 'system.schema.workbench.manage');
    assert.strictEqual(route.apiExposure, 'schemaWorkbench');
    assert.strictEqual(route.controller, 'DefaultSchemaWorkbenchController');
    assert.strictEqual(route.method, 'POST');
});

console.log('Schema Workbench router security contract validated');
