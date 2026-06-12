const { assertRouteContracts } = require('../../../../gFramework/nRouter/test/routerContractTestUtils');
const routerConfig = require('../src/router/router');

const workflowController = 'DefaultWorkflowController';
const expectedRoutes = [
    { key: '/carrier/init', method: 'PUT', controller: workflowController, operation: 'initCarrier', secured: true },
    { key: '/carrier/release/:carrierCode', method: 'POST', controller: workflowController, operation: 'releaseCarrier', secured: true },
    { key: '/carrier/update', method: 'PUT', controller: workflowController, operation: 'updateCarrier', secured: true },
    { key: '/action/process/:carrierCode', method: 'POST', controller: workflowController, operation: 'performAction', secured: true }
];

assertRouteContracts(routerConfig, expectedRoutes);
console.log(`Workflow route contract validated: ${expectedRoutes.length} routes`);
