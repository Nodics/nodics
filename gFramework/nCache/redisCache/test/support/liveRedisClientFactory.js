/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
