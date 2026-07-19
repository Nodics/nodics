/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
const assert = require('assert');
const routers = require('../src/router/routers').backoffice;

assert.strictEqual(routers.registryControl.register.permissionConfig, 'authSecurity.internalToken.routePermission');
assert.strictEqual(routers.registryControl.deregister.permissionConfig, 'authSecurity.internalToken.routePermission');
assert.strictEqual(routers.registryDiscovery.list.permission, 'backoffice.registry.view');
assert.strictEqual(routers.registryDiscovery.diagnostics.permission, 'backoffice.registry.diagnostics.view');
[routers.registryControl.register, routers.registryControl.deregister, routers.registryDiscovery.list,
    routers.registryDiscovery.diagnostics].forEach(route => {
    assert.strictEqual(route.secured, true);
    assert.strictEqual(route.apiExposure, 'serviceRegistry');
});
console.log('BackOffice registry route security validated');
