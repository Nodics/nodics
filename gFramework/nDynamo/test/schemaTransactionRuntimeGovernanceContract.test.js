/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nDynamo/test/schemaTransactionRuntimeGovernanceContract
 * @description Verifies runtime schema configuration exposes and validates the nDatabase transaction contract.
 * @layer test
 * @owner nDynamo
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
const schemas = require('../src/schemas/schemas');
const interceptors = require('../src/interceptors/interceptors');
const service = require('../src/service/interceptors/defaultSchemaConfigurationSaveInterceptorService');

assert(schemas.dynamo.schemaConfiguration.definition.cache);
assert(schemas.dynamo.schemaConfiguration.definition.transaction);
assert.strictEqual(
    interceptors.validateTransactionSchemaConfiguration.handler,
    'DefaultSchemaConfigurationSaveInterceptorService.validateTransactionConfiguration'
);

let validated;
global.SERVICE = {
    DefaultDatabaseSchemaHandlerService: {
        validateTransactionConfiguration: input => {
            validated = input;
            return input.schema;
        }
    }
};

(async () => {
    await service.validateTransactionConfiguration({
        model: {
            moduleName: 'aiProviders',
            code: 'aiTokenBudget',
            transaction: { enabled: true, sideEffects: 'none' }
        }
    }, {});
    assert.strictEqual(validated.moduleName, 'aiProviders');
    assert.strictEqual(validated.schemaName, 'aiTokenBudget');
    console.log('Runtime schema transaction governance contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
