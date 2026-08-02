/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const redis = require('redis');

/**
 * @module redisCache/test/support/liveRedisClientFactory
 * @description Owns Redis SDK construction for guarded cross-module live-provider contract tests without moving provider authority outside nCache.
 * @layer test
 * @owner nCache/redisCache
 * @override Provider modules may supply an equivalent test bridge while preserving isolated endpoint and cleanup requirements.
 */
module.exports = {
    /** Creates an unconnected Redis client for an explicitly supplied live-test endpoint. */
    create: function (url) {
        return redis.createClient({ url: url });
    }
};
