/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');
const path = require('path');
const { spawn } = require('child_process');
const liveRedisClientFactory = require('../../../gFramework/nCache/redisCache/test/support/liveRedisClientFactory');

/**
 * @module backoffice/test/backofficeDistributedRegistryStoreLive
 * @description Optionally validates the BackOffice distributed lease-store contract against an explicitly configured isolated Redis endpoint.
 * @layer test
 * @owner backoffice
 * @override Deployment pipelines provide NODICS_CACHE_REDIS_URL and use --require-live when live provider evidence is mandatory.
 */

const url = process.env.NODICS_CACHE_REDIS_URL;
const requireLive = process.argv.includes('--require-live') || process.env.NODICS_CACHE_REQUIRE_LIVE === 'true';

if (!url) {
    assert(!requireLive, 'NODICS_CACHE_REDIS_URL is required for the BackOffice Redis release gate');
    console.log('BackOffice Redis live contract NOT EXECUTED: set NODICS_CACHE_REDIS_URL and use --require-live');
} else {
    run().catch(error => {
        console.error(error);
        process.exitCode = 1;
    });
}

async function run() {
    let clientOne = liveRedisClientFactory.create(url);
    let clientTwo = liveRedisClientFactory.create(url);
    await Promise.all([clientOne.connect(), clientTwo.connect()]);

    const prefix = 'nodics-backoffice-live-' + process.pid + '-' + Date.now() + ':';
    const loadLeases = readPositiveInteger('NODICS_BACKOFFICE_LOAD_LEASES', 256);
    const loadConcurrency = readPositiveInteger('NODICS_BACKOFFICE_LOAD_CONCURRENCY', 32);
    const maxLoadMs = readPositiveInteger('NODICS_BACKOFFICE_LOAD_MAX_MS', 30000);
    global.CONFIG = { get: name => name === 'backofficeRegistry' ? { store: {
        mode: 'distributed', moduleName: 'backoffice', engineName: 'redis', keyPrefix: prefix
    } } : undefined };
    global.SERVICE = {};
    const definition = require('../src/service/registry/defaultBackofficeRegistryStoreService');
    const replicaOne = Object.assign({}, definition, {
        _instances: new Map(), _metrics: Object.assign({}, definition._metrics),
        getDistributedClient: () => clientOne
    });
    const replicaTwo = Object.assign({}, definition, {
        _instances: new Map(), _metrics: Object.assign({}, definition._metrics),
        getDistributedClient: () => clientTwo
    });

    async function cleanup(client) {
        if (!client || !client.isOpen) return;
        const keys = [];
        for await (const key of client.scanIterator({ MATCH: prefix + '*', COUNT: 100 })) keys.push(key);
        if (keys.length > 0) await client.del(keys);
    }

    try {
        const expiresAt = Date.now() + 5000;
        const lease = { moduleName: 'cms', instanceId: 'live-runtime', expiresAt: expiresAt };
        await replicaOne.set('cms:live-runtime', lease, 5000);
        assert.deepStrictEqual(await replicaTwo.get('cms:live-runtime'), lease,
            'independent Redis clients must observe the shared lease');
        assert.strictEqual((await replicaTwo.values()).length, 1);

        const renewed = Object.assign({}, lease, { expiresAt: expiresAt + 5000 });
        await replicaTwo.set('cms:live-runtime', renewed, 10000);
        assert.strictEqual(await replicaOne.deleteIfExpiresAt('cms:live-runtime', expiresAt), false,
            'a stale replica must not delete a renewed provider lease');
        assert.deepStrictEqual(await replicaOne.get('cms:live-runtime'), renewed);
        assert.strictEqual(await replicaOne.deleteIfExpiresAt('cms:live-runtime', renewed.expiresAt), true);

        const ttlLease = { moduleName: 'cronjob', instanceId: 'ttl-runtime', expiresAt: Date.now() + 200 };
        await replicaOne.set('cronjob:ttl-runtime', ttlLease, 200);
        await new Promise(resolve => setTimeout(resolve, 300));
        assert.strictEqual(await replicaTwo.get('cronjob:ttl-runtime'), undefined,
            'Redis must expire a crashed runtime lease by provider TTL');

        await replicaTwo.set('cms:provider-recovery', Object.assign({}, lease, { instanceId: 'provider-recovery' }), 5000);
        await clientOne.disconnect();
        await assert.rejects(replicaOne.get('cms:provider-recovery'),
            'a disconnected provider client must fail closed');
        clientOne = liveRedisClientFactory.create(url);
        await clientOne.connect();
        assert.strictEqual((await replicaOne.get('cms:provider-recovery')).instanceId, 'provider-recovery',
            'the store must recover through the restored nCache-owned client');
        assert(replicaOne.diagnostics().metrics.errors > 0);

        const processLease = { moduleName: 'workflow', instanceId: 'process-runtime', expiresAt: Date.now() + 10000 };
        await runReplicaWorker({ operation: 'set', key: 'workflow:process-runtime', value: processLease, ttlMs: 10000 }, url, prefix);
        assert.deepStrictEqual((await runReplicaWorker({ operation: 'get', key: 'workflow:process-runtime' }, url, prefix)).result,
            processLease, 'a separate BackOffice store process must observe the shared lease');
        const processRenewed = Object.assign({}, processLease, { expiresAt: processLease.expiresAt + 10000 });
        await runReplicaWorker({ operation: 'set', key: 'workflow:process-runtime', value: processRenewed, ttlMs: 20000 }, url, prefix);
        assert.strictEqual((await runReplicaWorker({ operation: 'deleteIfExpiresAt', key: 'workflow:process-runtime',
            expiresAt: processLease.expiresAt }, url, prefix)).result, false,
        'a stale BackOffice process must not delete another process renewal');

        const loadStarted = process.hrtime.bigint();
        for (let offset = 0; offset < loadLeases; offset += loadConcurrency) {
            await Promise.all(Array.from({ length: Math.min(loadConcurrency, loadLeases - offset) }, (_, index) => {
                const sequence = offset + index;
                const value = { moduleName: 'load-module-' + (sequence % 64), instanceId: 'load-' + sequence,
                    expiresAt: Date.now() + 30000 };
                return replicaOne.set(value.moduleName + ':' + value.instanceId, value, 30000);
            }));
        }
        const loadMs = Number(process.hrtime.bigint() - loadStarted) / 1000000;
        assert(loadMs <= maxLoadMs, 'live Redis lease load exceeded the environment-owned latency budget');
        assert((await replicaTwo.size()) >= loadLeases, 'live Redis scan must observe the qualified lease workload');

        console.log('BackOffice Redis live contract validated: processes=2, leases=' + loadLeases +
            ', concurrency=' + loadConcurrency + ', writeMs=' + loadMs.toFixed(3) + ', maxMs=' + maxLoadMs);
    } finally {
        await cleanup(clientOne).catch(() => false);
        await cleanup(clientTwo).catch(() => false);
        await Promise.all([
            clientOne && clientOne.isOpen ? clientOne.quit().catch(() => false) : false,
            clientTwo && clientTwo.isOpen ? clientTwo.quit().catch(() => false) : false
        ]);
    }
}

function readPositiveInteger(name, fallback) {
    const value = Number(process.env[name] || fallback);
    assert(Number.isInteger(value) && value > 0, name + ' must be a positive integer');
    return value;
}

function runReplicaWorker(request, url, prefix) {
    const worker = path.resolve(__dirname, 'support/backofficeRedisReplicaWorker.js');
    return new Promise((resolve, reject) => {
        const child = spawn(process.execPath, [worker, JSON.stringify(request)], {
            env: Object.assign({}, process.env, {
                NODICS_CACHE_REDIS_URL: url,
                NODICS_BACKOFFICE_TEST_KEY_PREFIX: prefix
            }), stdio: ['ignore', 'pipe', 'pipe']
        });
        let output = '';
        let errorOutput = '';
        child.stdout.on('data', data => { output += data.toString(); });
        child.stderr.on('data', data => { errorOutput += data.toString(); });
        child.once('error', reject);
        child.once('exit', code => {
            if (code !== 0) reject(new Error('BackOffice replica worker failed: ' + errorOutput));
            else resolve(JSON.parse(output));
        });
    });
}
