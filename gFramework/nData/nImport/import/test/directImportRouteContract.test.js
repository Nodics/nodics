/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module import/test/directImportRouteContract
 * @description Verifies direct import API routes are owned by nImport, not nSystem.
 * @layer test
 * @owner nImport
 * @override Project modules may add governed import entry points, but framework-owned
 * import execution routes must stay in nImport to avoid duplicate authority paths.
 */

const assert = require('assert');
const { assertRouteContracts } = require('../../../../nRouter/test/routerContractTestUtils');
const importRouterConfig = require('../src/router/routers');
const systemRouterConfig = require('../../../../nSystem/src/router/routers');

const expectedImportRoutes = [
    { key: '/init', method: 'POST', controller: 'DefaultImportController', operation: 'importInitData', secured: true, permission: 'import.init.run' },
    { key: '/core', method: 'POST', controller: 'DefaultImportController', operation: 'importCoreData', secured: true, permission: 'import.core.run' },
    { key: '/sample', method: 'POST', controller: 'DefaultImportController', operation: 'importSampleData', secured: true, permission: 'import.sample.run' },
    { key: '/local', method: 'POST', controller: 'DefaultImportController', operation: 'importLocalData', secured: true, permission: 'import.local.run' },
    { key: '/media', method: 'POST', controller: 'DefaultImportController', operation: 'importMediaData', secured: true, permission: 'import.media.run' }
];

const importRoutes = assertRouteContracts(importRouterConfig, expectedImportRoutes);
expectedImportRoutes.forEach((expectedRoute) => {
    const route = importRoutes.find(item => item.key === expectedRoute.key && item.method === expectedRoute.method);
    assert.strictEqual(route.apiExposure, 'dataImport', expectedRoute.key + ' must remain dataImport exposed');
});

const mediaImportRoute = importRoutes.find(route => route.key === '/media' && route.method === 'POST');
assert.strictEqual(mediaImportRoute.help.url, 'http://host:port/nodics/import/v0/media');
assert.strictEqual(mediaImportRoute.help.body.moduleName.includes('generic schema-backed'), true, 'Media import must advertise generic module/schema target ownership');
assert.strictEqual(mediaImportRoute.help.body.schemaName.includes('schema/model'), true, 'Media import must advertise selected target model ownership');
assert.strictEqual(mediaImportRoute.help.body.definitionCode.includes('Optional future'), true, 'Media import templates must remain optional instead of primary authority');

const systemRoutes = assertRouteContracts(systemRouterConfig, []);
expectedImportRoutes.forEach((expectedRoute) => {
    assert.strictEqual(
        systemRoutes.some(route => route.key === expectedRoute.key && route.method === expectedRoute.method),
        false,
        expectedRoute.key + ' must not be exposed by nSystem'
    );
});

console.log('Direct import route ownership contract validated');
