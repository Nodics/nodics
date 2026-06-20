const { assertRouteContracts } = require('../../nRouter/test/routerContractTestUtils');
const routerConfig = require('../src/router/router');

const expectedRoutes = [
    { key: '/file/data', method: 'POST', controller: 'DefaultFileController', operation: 'getFileContent', secured: true },
    { key: '/file/download', method: 'POST', controller: 'DefaultFileController', operation: 'downloadFile', secured: true },
    { key: '/import/init', method: 'POST', controller: 'DefaultImportController', operation: 'importInitData', secured: true },
    { key: '/import/core', method: 'POST', controller: 'DefaultImportController', operation: 'importCoreData', secured: true },
    { key: '/import/sample', method: 'POST', controller: 'DefaultImportController', operation: 'importSampleData', secured: true },
    { key: '/import/local', method: 'POST', controller: 'DefaultImportController', operation: 'importLocalData', secured: true },
    { key: '/log/level', method: 'POST', controller: 'DefaultLogController', operation: 'changeLogLevel', secured: true },
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
    { key: '/contract/openapi', method: 'GET', controller: 'DefaultApiContractController', operation: 'getOpenApiContract', secured: true },
    { key: '/schema/indexes/all', method: 'GET', controller: 'DefaultSchemaIndexController', operation: 'updateModulesIndexes', secured: true },
    { key: '/test/runUTest', method: 'GET', controller: 'TestExecutionController', operation: 'runUTest', secured: true },
    { key: '/test/runNTest', method: 'GET', controller: 'TestExecutionController', operation: 'runNTest', secured: true },
    { key: '/export', method: 'GET', controller: 'DataExportController', operation: 'export', secured: true },
    { key: '/export', method: 'POST', controller: 'DataExportController', operation: 'export', secured: true }
];

assertRouteContracts(routerConfig, expectedRoutes);
console.log(`System route contract validated: ${expectedRoutes.length} routes`);
