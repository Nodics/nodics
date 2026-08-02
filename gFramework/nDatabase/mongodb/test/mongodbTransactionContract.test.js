/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const handler = require('../src/service/connection/defaultMongodbDatabaseConnectionHandlerService');

let ended = false; let receivedOptions; let transactionRuns = 0;
const session = {
    withTransaction: async (work, options) => {
        transactionRuns += 1; receivedOptions = options; await work();
    },
    endSession: async () => { ended = true; }
};
const database = {
    getClient: () => ({ startSession: () => session }),
    getCapabilities: () => ({
        transaction: { multiRecordAtomic: true }
    })
};

(async () => {
    assert.strictEqual(handler.transactionCapabilities(database).multiRecordAtomic, true);
    const replicaCapabilities = await handler.discoverCapabilities({
        command: async () => ({ setName: 'rs0', logicalSessionTimeoutMinutes: 30 })
    });
    assert.strictEqual(replicaCapabilities.transaction.multiRecordAtomic, true);
    const shardedCapabilities = await handler.discoverCapabilities({
        command: async () => ({ msg: 'isdbgrid', logicalSessionTimeoutMinutes: 30 })
    });
    assert.strictEqual(shardedCapabilities.transaction.multiRecordAtomic, true);
    const standaloneCapabilities = await handler.discoverCapabilities({
        command: async () => ({ logicalSessionTimeoutMinutes: 30 })
    });
    assert.strictEqual(standaloneCapabilities.transaction.multiRecordAtomic, false);
    assert.strictEqual(handler.transactionCapabilities({
        getCapabilities: () => standaloneCapabilities
    }).multiRecordAtomic, false);
    await assert.rejects(handler.executeTransaction({
        getCapabilities: () => standaloneCapabilities,
        getClient: database.getClient
    }, { maximumCommitTimeMs: 1200 }, async () => true), /replica set or sharded cluster/);
    const result = await handler.executeTransaction(database, {
        maximumCommitTimeMs: 1200
    }, async context => {
        assert.strictEqual(handler.transactionOperationOptions(context).session, session);
        return 'mongo-result';
    });
    assert.strictEqual(result, 'mongo-result');
    assert.strictEqual(transactionRuns, 1);
    assert.strictEqual(receivedOptions.readConcern.level, 'snapshot');
    assert.strictEqual(receivedOptions.writeConcern.w, 'majority');
    assert.strictEqual(receivedOptions.maxCommitTimeMS, 1200);
    assert.strictEqual(ended, true);
    console.log('MongoDB transaction adapter contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
