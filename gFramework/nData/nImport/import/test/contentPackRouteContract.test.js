/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/*
 * @module import/test/contentPackRouteContract
 * @description Verifies secured, permissioned, direct nImport content-pack routes.
 */

const assert = require('assert');

const routers = require('../../../../nSystem/src/router/routers').system.contentPacks;

assert.deepStrictEqual(
    {
        secured: routers.status.secured,
        permission: routers.status.permission,
        apiExposure: routers.status.apiExposure,
        key: routers.status.key,
        method: routers.status.method,
        controller: routers.status.controller,
        operation: routers.status.operation
    },
    {
        secured: true,
        permission: 'import.contentPack.view',
        apiExposure: 'dataImport',
        key: '/content-packs/:packCode',
        method: 'GET',
        controller: 'DefaultContentPackController',
        operation: 'getStatus'
    }
);
assert.strictEqual(routers.importPack.secured, true);
assert.strictEqual(routers.importPack.permission, 'import.contentPack.run');
assert.strictEqual(routers.importPack.method, 'POST');
assert.strictEqual(routers.importPack.operation, 'importPack');

console.log('Content-pack route contract validated');
