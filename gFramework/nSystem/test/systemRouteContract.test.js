/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const { assertRouteContracts } = require('../../nRouter/test/routerContractTestUtils');
const routerConfig = require('../src/router/routers');

const expectedRoutes = [
    { key: '/health/live', method: 'GET', controller: 'DefaultHealthController', operation: 'getLiveness', secured: false },
    { key: '/health/ready', method: 'GET', controller: 'DefaultHealthController', operation: 'getReadiness', secured: false },
    { key: '/health/ready/details', method: 'GET', controller: 'DefaultHealthController', operation: 'getReadinessDetails', secured: true, permission: 'system.health.readiness.view' },
    { key: '/content-packs/:packCode', method: 'GET', controller: 'DefaultContentPackController', operation: 'getStatus', secured: true, permission: 'import.contentPack.view' },
    { key: '/content-packs/:packCode/imports', method: 'POST', controller: 'DefaultContentPackController', operation: 'importPack', secured: true, permission: 'import.contentPack.run' },
    { key: '/log/level', method: 'POST', controller: 'DefaultLogController', operation: 'changeLogLevel', secured: true, permission: 'system.log.level.update' },
    { key: '/config', method: 'POST', controller: 'DefaultConfigurationController', operation: 'changeConfig', secured: true, permission: 'runtime.config.request.create' },
    { key: '/config/runtime/history', method: 'GET', controller: 'DefaultConfigurationController', operation: 'getRuntimeConfigurationHistory', secured: true, permission: 'runtime.config.history.view' },
    { key: '/config/runtime/summary', method: 'GET', controller: 'DefaultConfigurationController', operation: 'getRuntimeConfigurationGovernanceSummary', secured: true, permission: 'runtime.config.summary.view' },
    { key: '/config/runtime/cleanup/preview', method: 'POST', controller: 'DefaultConfigurationController', operation: 'previewRuntimeConfigurationGovernanceCleanup', secured: true, permission: 'runtime.config.cleanup.preview' },
    { key: '/config/runtime/cleanup', method: 'POST', controller: 'DefaultConfigurationController', operation: 'cleanupRuntimeConfigurationGovernance', secured: true, permission: 'runtime.config.cleanup.execute' },
    { key: '/config/runtime/preview', method: 'POST', controller: 'DefaultConfigurationController', operation: 'previewRuntimeConfiguration', secured: true, permission: 'runtime.config.preview' },
    { key: '/config/runtime/request', method: 'POST', controller: 'DefaultConfigurationController', operation: 'createRuntimeConfigurationActivationRequest', secured: true, permission: 'runtime.config.request.create' },
    { key: '/config/runtime/request', method: 'GET', controller: 'DefaultConfigurationController', operation: 'getRuntimeConfigurationActivationRequests', secured: true, permission: 'runtime.config.request.view' },
    { key: '/config/runtime/request/approve', method: 'POST', controller: 'DefaultConfigurationController', operation: 'approveRuntimeConfigurationActivationRequest', secured: true, permission: 'runtime.config.request.approve' },
    { key: '/config/runtime/request/reject', method: 'POST', controller: 'DefaultConfigurationController', operation: 'rejectRuntimeConfigurationActivationRequest', secured: true, permission: 'runtime.config.request.reject' },
    { key: '/config/runtime/request/activate', method: 'POST', controller: 'DefaultConfigurationController', operation: 'activateRuntimeConfigurationActivationRequest', secured: true, permission: 'runtime.config.request.activate' },
    { key: '/config/runtime/rollback', method: 'POST', controller: 'DefaultConfigurationController', operation: 'rollbackRuntimeConfiguration', secured: true, permission: 'runtime.config.rollback' },
    { key: '/contract/openapi/internal', method: 'GET', controller: 'DefaultApiContractController', operation: 'getOpenApiContract', secured: true, permissionConfig: 'authSecurity.internalToken.routePermission' },
    { key: '/contract/openapi', method: 'GET', controller: 'DefaultApiContractController', operation: 'getOpenApiContract', secured: false, permission: 'system.contract.openapi.view' },
    { key: '/contract/swagger', method: 'GET', controller: 'DefaultApiContractController', operation: 'getSwaggerUi', secured: false, permission: 'system.contract.swagger.view' },
    { key: '/contract/swagger/asset/:assetName', method: 'GET', controller: 'DefaultApiContractController', operation: 'getSwaggerAsset', secured: false, permission: 'system.contract.swagger.view' },
    { key: '/schema/indexes/all', method: 'POST', controller: 'DefaultSchemaIndexController', operation: 'updateModulesIndexes', secured: true, permission: 'system.schema.index.rebuild' },
    { key: '/test/runUTest', method: 'POST', controller: 'TestExecutionController', operation: 'runUTest', secured: true, permission: 'system.test.unit.run' },
    { key: '/test/runNTest', method: 'POST', controller: 'TestExecutionController', operation: 'runNTest', secured: true, permission: 'system.test.nodics.run' }
];

const routes = assertRouteContracts(routerConfig, expectedRoutes);
['/file/data', '/file/download', '/export', '/import/init', '/import/core', '/import/sample', '/import/local', '/import/media'].forEach((key) => {
    assert.strictEqual(routes.some(route => route.key === key), false, key + ' must not be exposed by nSystem');
});
const livenessRoute = routes.find(route => route.key === '/health/live' && route.method === 'GET');
assert.strictEqual(livenessRoute.publicProbe, true, 'Liveness route must bypass enterprise/tenant request pipeline resolution');
const readinessRoute = routes.find(route => route.key === '/health/ready' && route.method === 'GET');
assert.strictEqual(readinessRoute.publicProbe, true, 'Readiness probe must bypass human authentication and tenant resolution');
const internalContractRoute = routes.find(route => route.key === '/contract/openapi/internal' && route.method === 'GET');
assert.strictEqual(internalContractRoute.apiExposure, 'serviceRegistry');
assert.notStrictEqual(internalContractRoute.publicAccess, true, 'Internal contract discovery must not use public documentation access');
['/contract/openapi', '/contract/swagger', '/contract/swagger/asset/:assetName'].forEach((key) => {
    const route = routes.find(item => item.key === key && item.method === 'GET');
    assert.strictEqual(route.publicAccess, true, key + ' must be browser-accessible when openApiContract exposure is enabled');
    assert.strictEqual(route.apiExposure, 'openApiContract', key + ' must remain exposure-gated');
});
console.log(`System route contract validated: ${expectedRoutes.length} routes`);
