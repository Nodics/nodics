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

let staleCompoundUniqueIndexes = [{
    name: 'providerCode_1_enterpriseCode_1',
    key: { providerCode: 1, enterpriseCode: 1 },
    unique: true
}, {
    name: 'unrelated_1',
    key: { unrelated: 1 }
}];
plan = service.finalizeIndexes([{
    fields: { providerCode: 1, enterpriseCode: 1 },
    options: {}
}], staleCompoundUniqueIndexes, false);
assert.deepStrictEqual(plan.create, [{
    fields: { providerCode: 1, enterpriseCode: 1 },
    options: {}
}]);
assert.deepStrictEqual(plan.drop, ['providerCode_1_enterpriseCode_1']);

global.SERVICE = {
    DefaultNodicsPromiseService: {
        all: function (promises) {
            return Promise.all(promises);
        }
    }
};

async function verifyStaleIndexIsDroppedBeforeReplacementCreate() {
    const operations = [];
    const originalDropIndex = service.dropIndex;
    const originalCreateIndex = service.createIndex;
    service.dropIndex = function (model, name) {
        operations.push('drop:' + name);
        return Promise.resolve(name);
    };
    service.createIndex = function (model, indexData) {
        operations.push('create:' + Object.keys(indexData.fields).join(','));
        return Promise.resolve(indexData.fields);
    };
    try {
        await service.executeIndexPlan({ modelName: 'TestModel' }, {
            drop: ['tenant_1'],
            create: [{ fields: { tenant: 1 }, options: {} }]
        });
    } finally {
        service.dropIndex = originalDropIndex;
        service.createIndex = originalCreateIndex;
    }
    assert.deepStrictEqual(operations, ['drop:tenant_1', 'create:tenant'],
        'Stale indexes must be dropped before replacement indexes are created');
}

verifyStaleIndexIsDroppedBeforeReplacementCreate().then(() => {
    console.log('MongoDB index reconciliation contract validated');
}).catch(error => {
    console.error(error);
    process.exit(1);
});
