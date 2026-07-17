/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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

const service = require('../src/service/access/defaultSchemaAccessPolicyContractService');
const schemas = require('../src/schemas/schemas');

assert(schemas.dynamo.schemaAccessPolicy, 'schemaAccessPolicy schema should be registered in dynamo');
assert.strictEqual(schemas.dynamo.schemaAccessPolicy.model, true);
assert.strictEqual(schemas.dynamo.schemaAccessPolicy.service.enabled, true);
assert.strictEqual(schemas.dynamo.schemaAccessPolicy.router.enabled, true);
assert.strictEqual(schemas.dynamo.schemaAccessPolicy.definition.moduleName.required, true);
assert.strictEqual(schemas.dynamo.schemaAccessPolicy.definition.schemaName.required, true);
assert.strictEqual(schemas.dynamo.schemaAccessPolicy.definition.actions.required, true);
assert.strictEqual(schemas.dynamo.schemaAccessPolicy.definition.effect.required, true);

assert.deepStrictEqual(service.getSupportedActions(), ['read', 'create', 'update', 'delete', 'import', 'export']);
assert.deepStrictEqual(service.getSupportedEffects(), ['ALLOW', 'DENY', 'MASK', 'HIDE', 'READONLY']);

let validPolicy = service.validatePolicy({
    moduleName: 'catalog',
    schemaName: 'product',
    propertyName: 'productCode',
    userGroups: ['catalogViewerUserGroup'],
    actions: ['READ', 'export', 'read'],
    effect: 'mask',
    maskStrategy: 'last4'
});
assert.strictEqual(validPolicy.valid, true);
assert.deepStrictEqual(validPolicy.policy.actions, ['read', 'export']);
assert.strictEqual(validPolicy.policy.effect, 'MASK');
assert.strictEqual(validPolicy.policy.priority, 100);
assert.strictEqual(validPolicy.policy.status, 'ACTIVE');

let schemaLevelPolicy = service.validatePolicy({
    moduleName: 'catalog',
    schemaName: 'product',
    actions: 'update',
    effect: 'readonly'
});
assert.strictEqual(schemaLevelPolicy.valid, true);
assert.deepStrictEqual(schemaLevelPolicy.policy.actions, ['update']);
assert.strictEqual(schemaLevelPolicy.policy.propertyName, '*');
assert.strictEqual(schemaLevelPolicy.policy.effect, 'READONLY');

let missingFields = service.validatePolicy({});
assert.strictEqual(missingFields.valid, false);
assert(missingFields.errors.some(error => error.field === 'moduleName' && error.type === 'required'));
assert(missingFields.errors.some(error => error.field === 'schemaName' && error.type === 'required'));
assert(missingFields.errors.some(error => error.field === 'actions' && error.type === 'required'));
assert(missingFields.errors.some(error => error.field === 'effect' && error.type === 'required'));

let unsupported = service.validatePolicy({
    moduleName: 'catalog',
    schemaName: 'product',
    actions: ['approve'],
    effect: 'OBSCURE'
});
assert.strictEqual(unsupported.valid, false);
assert(unsupported.errors.some(error => error.field === 'actions' && error.type === 'unsupported'));
assert(unsupported.errors.some(error => error.field === 'effect' && error.type === 'unsupported'));

let invalidMaskOnWrite = service.validatePolicy({
    moduleName: 'catalog',
    schemaName: 'product',
    propertyName: 'cost',
    actions: ['update'],
    effect: 'MASK'
});
assert.strictEqual(invalidMaskOnWrite.valid, false);
assert(invalidMaskOnWrite.errors.some(error => error.type === 'incompatible'));

let invalidReadonlyOnRead = service.validatePolicy({
    moduleName: 'catalog',
    schemaName: 'product',
    propertyName: 'cost',
    actions: ['read'],
    effect: 'READONLY'
});
assert.strictEqual(invalidReadonlyOnRead.valid, false);
assert(invalidReadonlyOnRead.errors.some(error => error.type === 'incompatible'));

console.log('Schema access policy contract service validated');
