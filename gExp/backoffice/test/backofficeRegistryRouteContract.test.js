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
assert.strictEqual(routers.registryDiscovery.bootstrap.permission, 'backoffice.bootstrap.view');
assert.strictEqual(routers.registryDiscovery.publicBootstrap.secured, false);
assert.strictEqual(routers.registryDiscovery.publicBootstrap.publicAccess, true);
assert.strictEqual(routers.registryDiscovery.publicBootstrap.apiExposure, 'serviceRegistry');
assert.strictEqual(routers.registryControl.register.requestBody.required, true);
assert(routers.registryDiscovery.bootstrap.help.parameters.some(parameter => parameter.name === 'x-nodics-client-contract-version'));
assert.strictEqual(routers.registryDiscovery.diagnostics.permission, 'backoffice.registry.diagnostics.view');
assert.strictEqual(routers.registryDiscovery.adminList.permission, 'backoffice.registry.admin.view');
assert.strictEqual(routers.registryDiscovery.adminDetail.permission, 'backoffice.registry.admin.view');
assert.strictEqual(routers.registryDiscovery.refresh.permission, 'backoffice.registry.refresh');
assert.strictEqual(routers.axisPolicy.get.permission, 'backoffice.axis.policy.view');
assert.strictEqual(routers.axisPolicy.update.permission, 'backoffice.axis.policy.update');
assert.strictEqual(routers.axisPolicy.update.requestBody.required, true);
assert.strictEqual(routers.contractHistory.current.permission, 'backoffice.contract.view');
assert.strictEqual(routers.contractHistory.history.permission, 'backoffice.contract.view');
assert.strictEqual(routers.contractHistory.approve.permission, 'backoffice.contract.approve');
assert.strictEqual(routers.contractHistory.reject.permission, 'backoffice.contract.reject');
assert.strictEqual(routers.contractHistory.rollback.permission, 'backoffice.contract.rollback');
assert.strictEqual(routers.contractHistory.approve.requestBody.required, true);
Object.values(routers.contractHistory).forEach(route => assert(route.responses['200']));
assert(routers.contractHistory.history.help.parameters.some(parameter => parameter.name === 'limit'));
[routers.registryControl.register, routers.registryControl.deregister, routers.registryDiscovery.list, routers.registryDiscovery.bootstrap,
    routers.registryDiscovery.diagnostics, routers.registryDiscovery.adminList, routers.registryDiscovery.adminDetail,
    routers.registryDiscovery.refresh, ...Object.values(routers.axisPolicy), ...Object.values(routers.contractHistory)].forEach(route => {
    assert.strictEqual(route.secured, true);
    assert.strictEqual(route.apiExposure, 'serviceRegistry');
});
assert(![routers.registryControl.register, routers.registryControl.deregister, routers.registryDiscovery.list,
    routers.registryDiscovery.bootstrap, routers.registryDiscovery.diagnostics].includes(routers.registryDiscovery.publicBootstrap));
console.log('BackOffice registry route security validated');
