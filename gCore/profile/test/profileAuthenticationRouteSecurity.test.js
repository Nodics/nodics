/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

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
const router = require('../src/router/routers').profile;

assert.strictEqual(router.authenticate.authenticateEmployee.secured, false, 'Employee username/password login must be pre-authentication');
assert.strictEqual(router.authenticate.authenticateCustomer.secured, false, 'Customer username/password login must be pre-authentication');
assert.strictEqual(router.authenticate.authenticateEmployee.help.requestType, 'pre-authentication');
assert.strictEqual(router.authenticate.authenticateCustomer.help.requestType, 'pre-authentication');
assert(router.authenticate.authenticateEmployee.help.body.loginId, 'Employee login route must expose loginId in route help for OpenAPI/Swagger');
assert(router.authenticate.authenticateEmployee.help.body.password, 'Employee login route must expose password in route help for OpenAPI/Swagger');
assert(router.authenticate.authenticateCustomer.help.body.loginId, 'Customer login route must expose loginId in route help for OpenAPI/Swagger');
assert(router.authenticate.authenticateCustomer.help.body.password, 'Customer login route must expose password in route help for OpenAPI/Swagger');
assert.strictEqual(router.authenticate.authenticateEmployee.help.parameters[0].name, 'x-enterprise-code');
assert.strictEqual(router.authenticate.authenticateCustomer.help.parameters[0].name, 'x-enterprise-code');

assert.strictEqual(router.loadDefaults.getInternalAuthToken.secured, true, 'Internal module-token retrieval must remain secured');
assert.strictEqual(router.loadDefaults.getInternalAuthToken.permissionConfig, 'authSecurity.internalToken.routePermission');
assert.strictEqual(router.loadDefaults.getInternalAuthToken.help.requestType, 'secured');

console.log('Profile authentication route security boundary validated');
