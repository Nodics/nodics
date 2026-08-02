/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const modulePackage = require('../package.json');
const routes = require('../src/router/routers').import;

assert.strictEqual(modulePackage.nodics.runtime.router, true);
assert.strictEqual(routes.dataReleases.catalogueInit.key, '/init');
assert.strictEqual(routes.dataReleases.catalogueCore.key, '/core');
assert.strictEqual(routes.dataReleases.catalogueSample.key, '/sample');
assert.strictEqual(routes.dataReleases.catalogueInit.permission, 'import.release.view');
assert.deepStrictEqual(routes.dataReleases.catalogueInit.permissions, ['import.core.run']);
assert.strictEqual(routes.dataReleases.catalogueCore.permission, 'import.release.view');
assert.deepStrictEqual(routes.dataReleases.catalogueCore.permissions, ['import.core.run']);
assert.strictEqual(routes.dataReleases.catalogueSample.permission, 'import.release.view');
assert.deepStrictEqual(routes.dataReleases.catalogueSample.permissions, ['import.core.run']);
assert.strictEqual(routes.dataReleases.catalogueInit.method, 'GET');
assert.strictEqual(routes.dataReleases.catalogueCore.method, 'GET');
assert.strictEqual(routes.dataReleases.catalogueSample.method, 'GET');
assert.strictEqual(routes.dataReleases.preflightInit.key, '/init/validate');
assert.strictEqual(routes.dataReleases.preflightCore.key, '/core/validate');
assert.strictEqual(routes.dataReleases.preflightSample.key, '/sample/validate');
assert.strictEqual(routes.dataReleases.preflightInit.permission, 'import.release.validate');
assert.deepStrictEqual(routes.dataReleases.preflightInit.permissions, ['import.core.run']);
assert.strictEqual(routes.dataReleases.preflightCore.permission, 'import.release.validate');
assert.deepStrictEqual(routes.dataReleases.preflightCore.permissions, ['import.core.run']);
assert.strictEqual(routes.dataReleases.preflightSample.permission, 'import.release.validate');
assert.deepStrictEqual(routes.dataReleases.preflightSample.permissions, ['import.core.run']);
assert.strictEqual(routes.dataReleases.preflightInit.method, 'POST');
assert.strictEqual(routes.dataReleases.preflightCore.method, 'POST');
assert.strictEqual(routes.dataReleases.preflightSample.method, 'POST');
assert.strictEqual(routes.dataReleases.executeInit.key, '/init/install');
assert.strictEqual(routes.dataReleases.executeCore.key, '/core/install');
assert.strictEqual(routes.dataReleases.executeSample.key, '/sample/install');
assert.strictEqual(routes.dataReleases.executeInit.permission, 'import.init.run');
assert.strictEqual(routes.dataReleases.executeCore.permission, 'import.core.run');
assert.strictEqual(routes.dataReleases.executeSample.permission, 'import.sample.run');
assert.strictEqual(routes.dataReleases.executeInit.method, 'POST');
assert.strictEqual(routes.dataReleases.executeCore.method, 'POST');
assert.strictEqual(routes.dataReleases.executeSample.method, 'POST');
assert.strictEqual(routes.importRunHistory.getImportRunHistory.permission, 'import.history.view');
assert.deepStrictEqual(routes.importRunHistory.getImportRunHistory.permissions, ['import.core.run']);
assert.strictEqual(routes.importRunHistory.getImportRun.permission, 'import.history.detail.view');
assert.deepStrictEqual(routes.importRunHistory.getImportRun.permissions, ['import.core.run']);
console.log('Data release route contracts validated');
