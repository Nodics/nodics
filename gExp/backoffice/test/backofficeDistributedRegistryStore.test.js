/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module backoffice/test/backofficeDistributedRegistryStore
 * @description Validates shared TTL storage, replica visibility, expiry, deletion, diagnostics, and provider failure behavior.
 * @layer test
 * @owner backoffice
 */
const assert = require('assert');

let config = {
    store: { mode: 'distributed', moduleName: 'backoffice', engineName: 'redis', keyPrefix: 'registry:test:' }
};
let records = new Map();
let now = 1000;
let client = {
    set: async (key, value, options) => { records.set(key, { value: value, expiresAt: now + options.PX }); return 'OK'; },
    get: async key => {
        let record = records.get(key);
        if (!record || record.expiresAt <= now) { records.delete(key); return null; }
        return record.value;
    },
    del: async key => records.delete(key) ? 1 : 0,
    eval: async (script, options) => {
        let record = records.get(options.keys[0]);
        if (!record) return 0;
        let lease = JSON.parse(record.value);
        if (String(lease.expiresAt) !== options.arguments[0]) return -1;
        records.delete(options.keys[0]);
        return 1;
    },
    mGet: async keys => Promise.all(keys.map(key => client.get(key))),
    scanIterator: async function* (options) {
        let prefix = options.MATCH.slice(0, -1);
        for (let key of records.keys()) if (key.startsWith(prefix) && await client.get(key)) yield key;
    }
};
global.CONFIG = { get: name => name === 'backofficeRegistry' ? config : undefined };
global.SERVICE = { DefaultCacheEngineService: { getEngineClient: (moduleName, engineName) => {
    assert.strictEqual(moduleName, 'backoffice');
    assert.strictEqual(engineName, 'redis');
    return client;
} } };

const definition = require('../src/service/registry/defaultBackofficeRegistryStoreService');
let replicaOne = Object.assign({}, definition, { _instances: new Map(), _metrics: Object.assign({}, definition._metrics) });
let replicaTwo = Object.assign({}, definition, { _instances: new Map(), _metrics: Object.assign({}, definition._metrics) });

async function run() {
    let lease = { moduleName: 'cms', instanceId: 'runtime-1', expiresAt: now + 5000 };
    await replicaOne.set('cms:runtime-1', lease, 5000);
    assert.deepStrictEqual(await replicaTwo.get('cms:runtime-1'), lease, 'replicas must observe one shared provider lease');
    assert.strictEqual((await replicaTwo.values()).length, 1);
    assert.strictEqual(await replicaTwo.size(), 1);
    assert.strictEqual(replicaTwo.diagnostics().distributed, true);
    assert.strictEqual(replicaTwo.diagnostics().available, true);

    now += 5001;
    assert.strictEqual(await replicaOne.get('cms:runtime-1'), undefined, 'provider TTL must expire a crashed runtime lease');
    assert.strictEqual(await replicaTwo.size(), 0);

    await replicaOne.set('cms:runtime-2', Object.assign({}, lease, { instanceId: 'runtime-2' }), 5000);
    assert.strictEqual(await replicaTwo.delete('cms:runtime-2'), true);
    assert.strictEqual(await replicaOne.size(), 0);

    let stale = { moduleName: 'cms', instanceId: 'runtime-race', expiresAt: now + 1000 };
    await replicaOne.set('cms:runtime-race', stale, 1000);
    let renewed = Object.assign({}, stale, { expiresAt: now + 5000 });
    await replicaTwo.set('cms:runtime-race', renewed, 5000);
    assert.strictEqual(await replicaOne.deleteIfExpiresAt('cms:runtime-race', stale.expiresAt), false,
        'stale replica must not delete a lease renewed by another replica');
    assert.deepStrictEqual(await replicaOne.get('cms:runtime-race'), renewed);
    assert.strictEqual(await replicaOne.deleteIfExpiresAt('cms:runtime-race', renewed.expiresAt), true);
    assert(replicaOne.diagnostics().metrics.conditionalDeleteConflicts > 0);

    let atomicEval = client.eval;
    client.eval = undefined;
    await replicaOne.set('cms:unsupported', Object.assign({}, lease, { instanceId: 'unsupported' }), 5000);
    await assert.rejects(replicaOne.deleteIfExpiresAt('cms:unsupported', lease.expiresAt), /atomic conditional delete support/);
    client.eval = atomicEval;
    await replicaOne.delete('cms:unsupported');

    global.SERVICE.DefaultCacheEngineService.getEngineClient = () => null;
    await assert.rejects(replicaOne.get('missing'), /distributed registry store is unavailable/);
    assert.strictEqual(replicaOne.diagnostics().available, false);
    assert(replicaOne.diagnostics().metrics.errors > 0);
    console.log('BackOffice distributed registry store validated');
}

run().catch(error => { console.error(error); process.exit(1); });
