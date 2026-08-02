/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');

const database = {
    getOptions: () => ({ connectionHandler: 'QualifiedTransactionAdapter' })
};
const eligibleSchemaModel = {
    rawSchema: {
        transaction: { enabled: true, sideEffects: 'none' },
        cache: { enabled: false },
        event: { enabled: false }
    }
};
const otherDatabase = {};
let committed = false; let aborted = false; let capturedToken;

global.CONFIG = {
    get: key => key === 'databaseTransactions' ? {
        enabled: true, failClosed: true, maximumCommitTimeMs: 5000
    } : undefined
};
global.SERVICE = {
    DefaultDatabaseConfigurationService: {
        getTenantDatabase: (moduleName, tenant) =>
            moduleName === 'catalog' && tenant === 'tenant-a' ? { master: database } : undefined
    },
    QualifiedTransactionAdapter: {
        transactionCapabilities: () => ({ multiRecordAtomic: true }),
        transactionOperationOptions: context => ({ transactionMarker: context.marker }),
        executeTransaction: async (target, options, work) => {
            assert.strictEqual(target, database);
            assert.strictEqual(options.maximumCommitTimeMs, 5000);
            try {
                const result = await work({ marker: 'session-a' });
                committed = true;
                return result;
            } catch (error) {
                aborted = true;
                throw error;
            }
        }
    }
};

const service = require('../src/service/transaction/defaultDatabaseTransactionService');
global.SERVICE.DefaultDatabaseTransactionService = service;

(async () => {
    assert.strictEqual(service.capabilities({
        moduleName: 'catalog', tenant: 'tenant-a'
    }).multiRecordAtomic, true);
    const result = await service.execute({
        moduleName: 'catalog', tenant: 'tenant-a'
    }, async token => {
        capturedToken = token;
        assert(Object.isFrozen(token));
        assert.strictEqual(service.operationOptions(token, database,
            eligibleSchemaModel).transactionMarker, 'session-a');
        assert.throws(() => service.operationOptions(token, otherDatabase,
            eligibleSchemaModel), /another database/);
        assert.throws(() => service.operationOptions(token, database, {
            rawSchema: { transaction: { enabled: false } }
        }), /not enabled/);
        assert.throws(() => service.operationOptions(token, database, {
            rawSchema: {
                transaction: { enabled: true, sideEffects: 'none' },
                event: { enabled: true }
            }
        }), /side effects/);
        return 'committed-result';
    });
    assert.strictEqual(result, 'committed-result');
    assert.strictEqual(committed, true);
    assert.throws(() => service.operationOptions(capturedToken, database,
        eligibleSchemaModel), /invalid, expired/);

    await assert.rejects(service.execute({
        moduleName: 'catalog', tenant: 'tenant-a'
    }, async () => { throw new Error('forced rollback'); }), /forced rollback/);
    assert.strictEqual(aborted, true);
    assert.strictEqual(service.capabilities({
        moduleName: 'missing', tenant: 'tenant-a'
    }).multiRecordAtomic, false);
    console.log('Provider-neutral database transaction contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
