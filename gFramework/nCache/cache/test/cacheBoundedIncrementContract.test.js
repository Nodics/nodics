/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');

global.CLASSES = {
    CacheError: class CacheError extends Error {
        constructor(error) { super(error instanceof Error ? error.message : error); }
    }
};
global.SERVICE = {
    DefaultCacheConfigurationService: {
        createStorageKey: options => options.key,
        createStoragePrefix: () => '',
        resolveTtl: options => options.ttl || 60
    }
};

const local = require('../../nodeCache/src/service/cache/defaultLocalCacheService');
const values = new Map();
const options = {
    key: 'counter',
    amount: 1,
    maximum: 2,
    ttl: 60,
    channel: {
        client: {
            get: key => values.get(key),
            set: (key, value) => values.set(key, value)
        }
    }
};

Promise.resolve(local.incrementBounded(options))
    .then(first => {
        assert.deepStrictEqual(first, { allowed: true, value: 1, maximum: 2 });
        return local.incrementBounded(options);
    })
    .then(second => {
        assert.deepStrictEqual(second, { allowed: true, value: 2, maximum: 2 });
        return local.incrementBounded(options);
    })
    .then(rejected => {
        assert.deepStrictEqual(rejected, { allowed: false, value: 2, maximum: 2 });
        assert.strictEqual(values.get('counter'), 2);
        console.log('Cache bounded increment contract tests passed');
    });
