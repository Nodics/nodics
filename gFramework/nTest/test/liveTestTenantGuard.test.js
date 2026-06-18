/**
 * @module nTest/test/liveTestTenantGuard
 * @description Verifies default and configured protected-tenant resolution plus explicit live-test override behavior.
 * @layer test
 * @owner nTest
 * @override Projects may add protected-tenant scenarios without weakening the default guard.
 */
const assert = require('assert');
const {
    collectTenantGuardFailures,
    getProtectedTenants
} = require('../src/tooling/liveTestTenantGuard');

// @nodics-capability-behavior @nodics-area testing
assert.deepStrictEqual(getProtectedTenants({}), ['default']);
assert.deepStrictEqual(getProtectedTenants({
    NODICS_TEST_PROTECTED_TENANTS: 'default, master, production '
}), ['default', 'master', 'production']);

assert(collectTenantGuardFailures({
    tenant: undefined,
    env: {}
}).includes('NODICS_TEST_TENANT'));

assert.strictEqual(collectTenantGuardFailures({
    tenant: 'nodicsTest',
    env: {}
}).length, 0);

assert(collectTenantGuardFailures({
    tenant: 'default',
    env: {}
}).some(failure => failure.includes('dedicated test tenant')));

assert.strictEqual(collectTenantGuardFailures({
    tenant: 'default',
    env: {
        NODICS_TEST_ALLOW_PROTECTED_TENANT: 'true'
    }
}).length, 0);

console.log('Live generated test tenant guard validated');
