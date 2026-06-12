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
    { key: '/config', method: 'POST', controller: 'DefaultConfigurationController', operation: 'changeConfig', secured: true },
    { key: '/schema/indexes/all', method: 'GET', controller: 'DefaultSchemaIndexController', operation: 'updateModulesIndexes', secured: true },
    { key: '/test/runUTest', method: 'GET', controller: 'TestExecutionController', operation: 'runUTest', secured: true },
    { key: '/test/runNTest', method: 'GET', controller: 'TestExecutionController', operation: 'runNTest', secured: true },
    { key: '/export', method: 'GET', controller: 'DataExportController', operation: 'export', secured: true },
    { key: '/export', method: 'POST', controller: 'DataExportController', operation: 'export', secured: true }
];

assertRouteContracts(routerConfig, expectedRoutes);
console.log(`System route contract validated: ${expectedRoutes.length} routes`);
