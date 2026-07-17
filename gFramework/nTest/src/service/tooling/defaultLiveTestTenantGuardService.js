/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nTest/service/tooling/defaultLiveTestTenantGuardService
 * @description Guards live and destructive test execution from missing tenant selection or accidental use of protected tenants.
 * @layer tooling
 * @owner nTest
 * @override Projects may configure protected tenants through environment variables or explicitly replace the owning test command.
 */
function collectTenantGuardFailures(options) {
    let failures = [];
    let tenant = options.tenant;
    let protectedTenants = getProtectedTenants(options.env);
    let allowProtectedTenant = options.env.NODICS_TEST_ALLOW_PROTECTED_TENANT === 'true' ||
        options.env.NODICS_TEST_ALLOW_DEFAULT_TENANT === 'true';

    if (!tenant) {
        failures.push('NODICS_TEST_TENANT');
        return failures;
    }

    if (protectedTenants.includes(tenant) && !allowProtectedTenant) {
        failures.push('NODICS_TEST_TENANT must be a dedicated test tenant. Protected tenants: ' +
            protectedTenants.join(', ') +
            '. Set NODICS_TEST_ALLOW_PROTECTED_TENANT=true only for explicit local debugging.');
    }
    return failures;
}

function getProtectedTenants(env) {
    let configured = env.NODICS_TEST_PROTECTED_TENANTS || 'default';
    return configured.split(',')
        .map(value => value.trim())
        .filter(value => !!value);
}

module.exports = {
    collectTenantGuardFailures,
    getProtectedTenants
};
