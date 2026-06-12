const { assertRouteContracts } = require('../../../nRouter/test/routerContractTestUtils');
const routerConfig = require('../src/router/router');

const emsController = 'DefaultEmsClientController';
const expectedRoutes = [
    { key: '/publish', method: 'POST', controller: emsController, operation: 'publish', secured: true },
    { key: '/register/consumer/:consumer', method: 'GET', controller: emsController, operation: 'registerConsumers', secured: true },
    { key: '/register/consumers', method: 'POST', controller: emsController, operation: 'registerConsumers', secured: true },
    { key: '/register/publisher/:publisher', method: 'GET', controller: emsController, operation: 'registerPublishers', secured: true },
    { key: '/register/publishers', method: 'POST', controller: emsController, operation: 'registerPublishers', secured: true },
    { key: '/close/consumer/:consumer', method: 'GET', controller: emsController, operation: 'closeConsumers', secured: true },
    { key: '/close/consumers', method: 'POST', controller: emsController, operation: 'closeConsumers', secured: true },
    { key: '/close/publisher/:publisher', method: 'GET', controller: emsController, operation: 'closePublishers', secured: true },
    { key: '/close/publishers', method: 'POST', controller: emsController, operation: 'closePublishers', secured: true }
];

assertRouteContracts(routerConfig, expectedRoutes);
console.log(`EMS client route contract validated: ${expectedRoutes.length} routes`);
