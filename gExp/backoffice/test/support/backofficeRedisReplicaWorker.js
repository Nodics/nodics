/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const liveRedisClientFactory = require('../../../../gFramework/nCache/redisCache/test/support/liveRedisClientFactory');

/**
 * @module backoffice/test/support/backofficeRedisReplicaWorker
 * @description Runs one isolated BackOffice lease-store operation in a separate process for guarded multi-process Redis qualification.
 * @layer test
 * @owner backoffice
 */

async function run() {
    const request = JSON.parse(process.argv[2] || '{}');
    const url = process.env.NODICS_CACHE_REDIS_URL;
    const prefix = process.env.NODICS_BACKOFFICE_TEST_KEY_PREFIX;
    if (!url || !prefix) throw new Error('Replica worker requires isolated Redis URL and key prefix');
    const client = liveRedisClientFactory.create(url);
    await client.connect();
    global.CONFIG = { get: name => name === 'backofficeRegistry' ? { store: {
        mode: 'distributed', moduleName: 'backoffice', engineName: 'redis', keyPrefix: prefix
    } } : undefined };
    global.SERVICE = {};
    const store = Object.assign({}, require('../../src/service/registry/defaultBackofficeRegistryStoreService'), {
        _instances: new Map(), _metrics: {}, getDistributedClient: () => client
    });
    try {
        let result;
        if (request.operation === 'set') result = await store.set(request.key, request.value, request.ttlMs);
        else if (request.operation === 'get') result = await store.get(request.key);
        else if (request.operation === 'deleteIfExpiresAt') result = await store.deleteIfExpiresAt(request.key, request.expiresAt);
        else if (request.operation === 'size') result = await store.size();
        else throw new Error('Unsupported replica worker operation');
        process.stdout.write(JSON.stringify({ result: result }));
    } finally {
        await client.quit().catch(() => false);
    }
}

run().catch(error => {
    process.stderr.write(String(error && error.message || error));
    process.exit(1);
});
