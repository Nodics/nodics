/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nAuth/test/integration/AuthP2RedisLive
 * @description Runs the exactly-once refresh-token race against two real Redis
 * clients when an isolated live endpoint is explicitly supplied.
 * @layer test
 * @owner nAuth
 * @override Projects may point this test at an ephemeral CI Redis instance.
 */
const assert = require('assert');
const redis = require('redis');
const configuration = require('./authP2TestConfiguration').load();

class CacheError extends Error {
    constructor(code, message) { super(message || code && code.message || String(code)); }
}
global.CLASSES = { CacheError };
global.SERVICE = {
    DefaultCacheConfigurationService: require('../../../nCache/cache/src/service/config/defaultCacheConfigurationService')
};

async function run() {
    if (!configuration.redisUrl) {
        console.log('nAuth P2 live Redis NOT EXECUTED: set NODICS_AUTH_P2_REDIS_URL; use test:auth-p2:release to require it');
        return;
    }
    let clients = [redis.createClient({ url: configuration.redisUrl }), redis.createClient({ url: configuration.redisUrl })];
    await Promise.all(clients.map(client => client.connect()));
    let redisService = require('../../../nCache/redisCache/src/service/cache/defaultRedisCacheService');
    redisService.LOG = { debug: function () {} };
    let key = 'auth_' + configuration.tenant + '_live-refresh-' + Date.now();
    let channel = client => ({ channelName: 'auth', client: client, engineOptions: { ttl: 60, options: { prefix: configuration.tenant } }, chennalOptions: { ttl: 60 } });
    try {
        await clients[0].set(key, JSON.stringify({ tenant: configuration.tenant, loginId: 'live-user' }), { EX: 60 });
        let token = key.substring(('auth_' + configuration.tenant + '_').length);
        let outcomes = await Promise.allSettled(Array.from({ length: 20 }, (unused, index) => redisService.consume({ key: token, channel: channel(clients[index % 2]) })));
        assert.strictEqual(outcomes.filter(item => item.status === 'fulfilled').length, 1);
        assert.strictEqual(outcomes.filter(item => item.status === 'rejected').length, 19);
        console.log('nAuth P2 live Redis exactly-once contract validated');
    } finally {
        await clients[0].del(key).catch(() => false);
        await Promise.all(clients.map(client => client.quit().catch(() => false)));
    }
}

run().catch(error => { console.error(error); process.exit(1); });
