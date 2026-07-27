/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
const assert = require('assert');
const modulePackage = require('../package.json');
const routes = require('../src/router/routers').import;

assert.strictEqual(modulePackage.nodics.runtime.router, true);
assert.strictEqual(routes.dataReleases.catalogue.permission, 'import.release.view');
assert.deepStrictEqual(routes.dataReleases.catalogue.permissions, ['import.core.run']);
assert.strictEqual(routes.dataReleases.catalogue.method, 'GET');
assert.strictEqual(routes.dataReleases.preflight.permission, 'import.release.validate');
assert.deepStrictEqual(routes.dataReleases.preflight.permissions, ['import.core.run']);
assert.strictEqual(routes.dataReleases.preflight.method, 'POST');
assert.strictEqual(routes.dataReleases.executeInit.permission, 'import.init.run');
assert.strictEqual(routes.dataReleases.executeCore.permission, 'import.core.run');
assert.strictEqual(routes.dataReleases.executeSample.permission, 'import.sample.run');
assert.strictEqual(routes.dataReleases.executeCore.method, 'POST');
assert.strictEqual(routes.importRunHistory.getImportRunHistory.permission, 'import.history.view');
assert.deepStrictEqual(routes.importRunHistory.getImportRunHistory.permissions, ['import.core.run']);
assert.strictEqual(routes.importRunHistory.getImportRun.permission, 'import.history.detail.view');
assert.deepStrictEqual(routes.importRunHistory.getImportRun.permissions, ['import.core.run']);
console.log('Data release route contracts validated');
