/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiKnowledge/test/AiKnowledgeRouteSecurityContract
 * @description Verifies service-token and employee-permission boundaries on Knowledge runtime routes.
 * @layer test
 * @owner aiKnowledge
 */
const assert = require('assert');
const routes = require('../src/router/routers').aiKnowledge;

Object.values(routes.internal).forEach(route => {
    assert.strictEqual(route.secured, true);
    assert.strictEqual(route.apiExposure, 'moduleInternal');
    assert.strictEqual(route.permissionConfig, 'authSecurity.internalToken.routePermission');
    assert.strictEqual(route.permission, undefined);
});
Object.values(routes.operations).forEach(route => {
    assert.strictEqual(route.secured, true);
    assert.strictEqual(route.apiExposure, 'aiOperations');
    assert.ok(/^ai\.knowledge\.(read|manage)$/.test(route.permission));
    assert.strictEqual(route.permissionConfig, undefined);
});

console.log('AI Knowledge runtime route security validated');
