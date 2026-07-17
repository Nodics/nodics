/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nAuth/test/integration/AuthP2TestConfiguration
 * @description Resolves and validates isolated P2 authentication integration
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
        tenant: process.env.NODICS_AUTH_P2_TENANT || 'nodics_auth_p2_test',
        database: process.env.NODICS_AUTH_P2_DATABASE || 'nodics_auth_p2_test',
        redisUrl: process.env.NODICS_AUTH_P2_REDIS_URL,
        requireLive: args.includes('--require-live') || process.env.NODICS_AUTH_P2_REQUIRE_LIVE === 'true',
        correlationId: 'auth-p2-' + Date.now()
    };
    assert(hasTestMarker(configuration.tenant), 'P2 auth tenant must contain an explicit test marker');
    assert(hasTestMarker(configuration.database), 'P2 auth database must contain an explicit test marker');
    if (configuration.requireLive) assert(configuration.redisUrl, 'NODICS_AUTH_P2_REDIS_URL is required for the P2 release gate');
    return configuration;
}

module.exports = { hasTestMarker, load };
