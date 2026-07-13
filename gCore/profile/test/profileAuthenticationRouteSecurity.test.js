/**
 * @module profile/test/ProfileAuthenticationRouteSecurity
 * @description Verifies username/password login uses the pre-authentication
 * enterprise-resolution pipeline while module-to-module internal token
 * retrieval remains a secured service capability.
 * @layer test
 * @owner profile
 * @override Project modules may override authentication routes while preserving
 * the separation between human login and internal service access.
 */
const assert = require('assert');

// @nodics-capability-behavior @nodics-area profile
const router = require('../src/router/router').profile;

assert.strictEqual(router.authenticate.authenticateEmployee.secured, false, 'Employee username/password login must be pre-authentication');
assert.strictEqual(router.authenticate.authenticateCustomer.secured, false, 'Customer username/password login must be pre-authentication');
assert.strictEqual(router.authenticate.authenticateEmployee.help.requestType, 'pre-authentication');
assert.strictEqual(router.authenticate.authenticateCustomer.help.requestType, 'pre-authentication');

assert.strictEqual(router.loadDefaults.getInternalAuthToken.secured, true, 'Internal module-token retrieval must remain secured');
assert.strictEqual(router.loadDefaults.getInternalAuthToken.permissionConfig, 'authSecurity.internalToken.routePermission');
assert.strictEqual(router.loadDefaults.getInternalAuthToken.help.requestType, 'secured');

console.log('Profile authentication route security boundary validated');
