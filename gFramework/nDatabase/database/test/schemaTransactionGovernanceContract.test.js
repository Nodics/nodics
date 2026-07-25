/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module database/test/schemaTransactionGovernanceContract
 * @description Verifies nDatabase centrally validates transaction eligibility for static and runtime schemas.
 * @layer test
 * @owner nDatabase
 */
const assert = require('assert');

global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(code, message) {
            super(message || code);
            this.code = code;
        }
    }
};

const service = require('../src/service/schema/defaultDatabaseSchemaHandlerService');
const valid = {
    model: true,
    service: { enabled: true },
    cache: { enabled: false },
    event: { enabled: false },
    transaction: { enabled: true, sideEffects: 'none' }
};

assert.strictEqual(service.validateTransactionConfiguration({
    moduleName: 'owner', schemaName: 'eligible', schema: valid
}), valid);
assert.strictEqual(service.validateTransactionConfiguration({
    moduleName: 'owner', schemaName: 'ordinary', schema: { model: true }
}).model, true);

[
    { transaction: { enabled: false, sideEffects: 'none' }, model: true, service: { enabled: true } },
    { transaction: { enabled: true, sideEffects: 'deferred' }, model: true, service: { enabled: true } },
    { transaction: { enabled: true, sideEffects: 'none' }, model: false, service: { enabled: true } },
    { transaction: { enabled: true, sideEffects: 'none' }, model: true, service: { enabled: false } },
    Object.assign({}, valid, { cache: { enabled: true } }),
    Object.assign({}, valid, { event: { enabled: true } })
].forEach((schema, index) => {
    assert.throws(() => service.validateTransactionConfiguration({
        moduleName: 'owner', schemaName: 'invalid' + index, schema: schema
    }), /transaction/);
});

console.log('Schema transaction governance contract validated');
