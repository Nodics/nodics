/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nAuth/test/integration/AuthIntegrationTestConfiguration
 * @description Resolves and validates isolated distributed authentication integration
 * settings without embedding a customer project or production connection.
 * @layer test
 * @owner nAuth
 * @override Project test layers may supply environment values for their own
 * dedicated tenant, database, Redis endpoint, and topology.
 */
const assert = require('assert');

function hasTestMarker(value) {
    return typeof value === 'string' && /(^|[_-])test([_-]|$)/i.test(value);
}

function load(argv) {
    let args = argv || process.argv.slice(2);
    let configuration = {
        tenant: process.env.NODICS_AUTH_INTEGRATION_TENANT || 'nodics_auth_integration_test',
        database: process.env.NODICS_AUTH_INTEGRATION_DATABASE || 'nodics_auth_integration_test',
        redisUrl: process.env.NODICS_AUTH_REDIS_LIVE_URL,
        requireLive: args.includes('--require-live') || process.env.NODICS_AUTH_REDIS_REQUIRE_LIVE === 'true',
        correlationId: 'auth-distributed-' + Date.now()
    };
    assert(hasTestMarker(configuration.tenant), 'Auth integration tenant must contain an explicit test marker');
    assert(hasTestMarker(configuration.database), 'Auth integration database must contain an explicit test marker');
    if (configuration.requireLive) assert(configuration.redisUrl, 'NODICS_AUTH_REDIS_LIVE_URL is required for the Redis live release gate');
    return configuration;
}

module.exports = { hasTestMarker, load };
