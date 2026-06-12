const { assertRouteContracts } = require('../../../gFramework/nRouter/test/routerContractTestUtils');
const routerConfig = require('../src/router/router');

const expectedRoutes = [
    { key: '/auth/token/:tntCode', method: 'GET', controller: 'DefaultInternalAuthenticationProviderController', operation: 'getInternalAuthToken', secured: true },
    { key: '/enterprise/get', method: 'GET', controller: 'DefaultEnterpriseController', operation: 'getEnterprise', secured: true },
    { key: '/tenant/get', method: 'GET', controller: 'DefaultTenantController', operation: 'getTenants', secured: true },
    { key: '/employee/authenticate', method: 'POST', handler: 'DefaultAuthenticationProviderController', operation: 'authenticateEmployee', secured: true },
    { key: '/customer/authenticate', method: 'POST', handler: 'DefaultAuthenticationProviderController', operation: 'authenticateCustomer', secured: true },
    { key: '/token/authorize', method: 'POST', handler: 'DefaultAuthorizationProviderController', operation: 'authorizeToken', secured: true },
    { key: '/customer/exist', method: 'POST', controller: 'DefaultCustomerController', operation: 'isCustomerExist', secured: true },
    { key: '/customer/signup', method: 'POST', controller: 'DefaultCustomerController', operation: 'signUp', secured: true }
];

assertRouteContracts(routerConfig, expectedRoutes);
console.log(`Profile route contract validated: ${expectedRoutes.length} routes`);
