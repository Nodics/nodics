/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module mongodb/test/mongodbIndexReconciliationContract
 * @description Verifies MongoDB index reconciliation compares index options as
 * well as fields so stale unique indexes can be replaced by configuration.
 * @layer test
 * @owner mongodb
 * @override Database provider modules may customize reconciliation, but must not
 * treat different index options as an equivalent live index.
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

const service = require('../src/service/model/defaultMongodbDatabaseModelHandlerService');

let staleUniqueIndexes = [{
    name: 'tenant_1',
    key: { tenant: 1 },
    unique: true
}];
let plan = service.finalizeIndexes([{
    fields: { tenant: 1 },
    options: {}
}], staleUniqueIndexes, true);
assert.deepStrictEqual(plan.create, [{
    fields: { tenant: 1 },
    options: {}
}]);
assert.deepStrictEqual(plan.drop, ['tenant_1']);

let matchingNonUniqueIndexes = [{
    name: 'tenant_1',
    key: { tenant: 1 }
}];
plan = service.finalizeIndexes([{
    fields: { tenant: 1 },
    options: {}
}], matchingNonUniqueIndexes, true);
assert.deepStrictEqual(plan.create, []);
assert.deepStrictEqual(plan.drop || [], []);

let desiredUniqueIndexes = [{
    name: 'loginId_1',
    key: { loginId: 1 }
}];
plan = service.finalizeIndexes([{
    fields: { loginId: 1 },
    options: { unique: true }
}], desiredUniqueIndexes, true);
assert.deepStrictEqual(plan.create, [{
    fields: { loginId: 1 },
    options: { unique: true }
}]);
assert.deepStrictEqual(plan.drop, ['loginId_1']);

console.log('MongoDB index reconciliation contract validated');
