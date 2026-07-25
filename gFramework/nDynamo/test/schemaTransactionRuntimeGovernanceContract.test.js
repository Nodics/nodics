/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
