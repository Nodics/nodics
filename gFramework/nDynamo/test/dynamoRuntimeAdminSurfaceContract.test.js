/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nDynamo/test/dynamoRuntimeAdminSurfaceContract
 * @description Verifies nDynamo exposes only the intended runtime administration API surfaces and keeps activation request/log governance records internal to services.
 * @layer test
 * @owner nDynamo
 * @override Projects may add custom runtime governance APIs in later modules, but the base nDynamo surface must keep dynamic class routes secured and activation governance records non-routed by default.
 */

const assert = require('assert');

global.ENUMS = {
    ClassType: {
        SERVICE: { key: 'SERVICE' },
        FACADE: { key: 'FACADE' },
        CONTROLLER: { key: 'CONTROLLER' },
        UTILS: { key: 'UTILS' }
    }
};

const routerConfig = require('../src/router/router');
const schemas = require('../src/schemas/schemas').dynamo;

const classRoutes = routerConfig.dynamo.classOperations;
Object.keys(classRoutes).forEach(routeCode => {
    assert.strictEqual(classRoutes[routeCode].secured, true, routeCode + ' must be secured');
    assert.deepStrictEqual(classRoutes[routeCode].accessGroups, ['userGroup'], routeCode + ' must keep the base access group');
    assert.strictEqual(classRoutes[routeCode].controller, 'DefaultClassConfigurationController');
});

assert.strictEqual(schemas.classConfiguration.router.enabled, false, 'classConfiguration uses explicit secured class routes, not generated CRUD routes');
assert.strictEqual(schemas.routerConfiguration.router.enabled, true, 'routerConfiguration is a generated runtime admin API');
assert.strictEqual(schemas.schemaConfiguration.router.enabled, true, 'schemaConfiguration is a generated runtime admin API');
assert.strictEqual(schemas.pipeline.router.enabled, true, 'pipeline is a generated runtime admin API');
assert.strictEqual(schemas.schemaAccessPolicy.router.enabled, true, 'schemaAccessPolicy is a generated runtime admin API');
assert.strictEqual(schemas.configurationActivationRequest.router.enabled, false, 'activation requests are governed by services and are not public generated routes by default');
assert.strictEqual(schemas.configurationActivationLog.router.enabled, false, 'activation logs are audit records and are not public generated routes by default');

[
    'routerConfiguration',
    'schemaConfiguration',
    'pipeline',
    'schemaAccessPolicy',
    'configurationActivationRequest',
    'configurationActivationLog'
].forEach(schemaName => {
    assert.deepStrictEqual(schemas[schemaName].tenants, ['default'], schemaName + ' must stay tenant-scoped to the control-plane tenant by default');
});

assert(schemas.configurationActivationRequest.definition.configurationDigest, 'activation request must preserve property-payload integrity binding');
assert(schemas.configurationActivationLog.definition.previousSnapshot, 'activation log must preserve rollback previous snapshot');
assert(schemas.configurationActivationLog.definition.nextSnapshot, 'activation log must preserve activation next snapshot');

console.log('Dynamo runtime admin surface contract validated');
