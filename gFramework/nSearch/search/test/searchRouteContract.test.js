const { assertRouteContracts } = require('../../../nRouter/test/routerContractTestUtils');
const routerConfig = require('../src/router/router');

const expectedRoutes = [
    { key: '/schemaName/search/refresh', method: 'GET', controller: 'DefaultctrlName', operation: 'doRefresh', secured: true },
    { key: '/schemaName/search/refresh', method: 'POST', controller: 'DefaultctrlName', operation: 'doRefresh', secured: true },
    { key: '/schemaName/search/check/health', method: 'GET', controller: 'DefaultctrlName', operation: 'doCheckHealth', secured: true },
    { key: '/schemaName/search/exists/id/:id', method: 'GET', controller: 'DefaultctrlName', operation: 'doExists', secured: true },
    { key: '/schemaName/search/get/id/:id', method: 'GET', controller: 'DefaultctrlName', operation: 'doGet', secured: true },
    { key: '/schemaName/search/id/:id', method: 'GET', controller: 'DefaultctrlName', operation: 'doSearch', secured: true },
    { key: '/schemaName/search', method: 'POST', controller: 'DefaultctrlName', operation: 'doSearch', secured: true },
    { key: '/schemaName/search', method: 'PUT', controller: 'DefaultctrlName', operation: 'doSave', secured: true },
    { key: '/schemaName/search/all', method: 'PUT', controller: 'DefaultctrlName', operation: 'doBulk', secured: true },
    { key: '/schemaName/search/id/:id', method: 'DELETE', controller: 'DefaultctrlName', operation: 'doRemove', secured: true },
    { key: '/schemaName/search/schema/update', method: 'POST', controller: 'DefaultctrlName', operation: 'doUpdateSchema', secured: true },
    { key: '/schemaName/search/index', method: 'POST', controller: 'DefaultctrlName', operation: 'doIndexing', secured: true },
    { key: '/:indexName/search/refresh', method: 'GET', controller: 'DefaultSearchController', operation: 'doRefresh', secured: true },
    { key: '/:indexName/search/check/health', method: 'POST', controller: 'DefaultSearchController', operation: 'doCheckHealth', secured: true },
    { key: '/:indexName/search/get', method: 'POST', controller: 'DefaultSearchController', operation: 'doGet', secured: true },
    { key: '/:indexName/search', method: 'DELETE', controller: 'DefaultSearchController', operation: 'doRemoveByQuery', secured: true },
    { key: '/:indexName/search/schema', method: 'GET', controller: 'DefaultSearchController', operation: 'doGetSchema', secured: true },
    { key: '/:indexName/search/index/:indexerCode', method: 'GET', controller: 'DefaultSearchController', operation: 'doIndexing', secured: true }
];

assertRouteContracts(routerConfig, expectedRoutes);
console.log(`Search route contract validated: ${expectedRoutes.length} routes`);
