const { assertRouteContracts } = require('../../nRouter/test/routerContractTestUtils');
const routerConfig = require('../src/router/router');

const classController = 'DefaultClassConfigurationController';
const expectedRoutes = [
    { key: '/class/get/:className', method: 'GET', controller: classController, operation: 'getClass', secured: true },
    { key: '/class/snapshot/:type/:className', method: 'GET', controller: classController, operation: 'getSnapshot', secured: true },
    { key: '/class/update/:type/:className', method: 'PUT', controller: classController, operation: 'updateClass', secured: true },
    { key: '/class/execute', method: 'POST', controller: classController, operation: 'executeClass', secured: true }
];

assertRouteContracts(routerConfig, expectedRoutes);
console.log(`Dynamo route contract validated: ${expectedRoutes.length} routes`);
