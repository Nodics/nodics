/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module storefront/test/storefrontTrafficResilienceContract
 * @description Validates hostname security, request coalescing, runtime concurrency changes, bounded queues, cleanup, and stable rejection behavior.
 * @layer test
 * @owner storefront
 * @override Projects may replace scheduling while preserving trusted-host selection, opaque coordination keys, bounds, and cleanup.
 */
const assert = require('assert');
const crypto = require('crypto');
const properties = require('../config/properties');
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
global.CLASSES = { NodicsError };
global.CONFIG = { get: (name) => name === 'storefront' ? properties.storefront : name === 'httpHardening' ? { trustProxy: false } : undefined };
global.SERVICE = {};
const endpointFoundation = require('../src/service/foundation/defaultStorefrontEndpointFoundationService');
const context = require('../src/service/defaultStorefrontContextService');
const traffic = require('../src/service/defaultStorefrontTrafficService');
SERVICE.DefaultStorefrontEndpointFoundationService = endpointFoundation;
SERVICE.DefaultStorefrontContextService = context;
SERVICE.DefaultStorefrontEnterpriseScopeService = { error: (code, message) => new NodicsError(code, message) };
SERVICE.DefaultStorefrontContextCacheService = {
    buildKey: (hostname) => 'storefrontContext:' + crypto.createHash('sha256').update(hostname).digest('hex')
};
let calls = 0, releases = [];
SERVICE.DefaultStorefrontContextCacheService.resolve = async (request) => {
    calls += 1;
    return new Promise((resolve, reject) => releases.push({ resolve: resolve, reject: reject, host: request.host || request.hostname }));
};

(async function () {
    let originalTraffic = Object.assign({}, properties.storefront.traffic), originalTrust = properties.storefront.host.trustForwardedHost;
    properties.storefront.traffic.maximumConcurrentResolutions = 1;
    properties.storefront.traffic.maximumQueuedResolutions = 1;
    properties.storefront.traffic.maximumInFlightKeys = 3;
    traffic.reset();

    let identical = Array.from({ length: 100 }, () => traffic.resolve({ host: 'electronics.nodics.com' }));
    let first = identical[0], coalesced = identical[1];
    await new Promise(resolve => setImmediate(resolve));
    assert.strictEqual(calls, 1, 'identical misses must share one authoritative/cache execution');
    assert.strictEqual(traffic.diagnostics().inFlightKeys, 1);

    let queued = traffic.resolve({ host: 'apparel.nodics.com' });
    await assert.rejects(traffic.resolve({ host: 'grocery.nodics.com' }), (error) => error.code === 'ERR_STOREFRONT_00014');
    assert.strictEqual(traffic.diagnostics().queued, 1);

    properties.storefront.traffic.maximumConcurrentResolutions = 2;
    traffic.drain();
    await new Promise(resolve => setImmediate(resolve));
    assert.strictEqual(calls, 2, 'runtime concurrency increase must take effect without restarting the service');
    releases[0].resolve({ storefrontCode: 'electronics' });
    releases[1].resolve({ storefrontCode: 'apparel' });
    assert.strictEqual((await first).storefrontCode, 'electronics');
    assert.strictEqual((await coalesced).storefrontCode, 'electronics');
    assert((await Promise.all(identical)).every(item => item.storefrontCode === 'electronics'));
    assert.strictEqual((await queued).storefrontCode, 'apparel');
    await new Promise(resolve => setImmediate(resolve));
    assert.deepStrictEqual(traffic.diagnostics(), { active: 0, queued: 0, inFlightKeys: 0 });

    let failed = traffic.resolve({ host: 'failure.nodics.com' });
    await new Promise(resolve => setImmediate(resolve));
    releases[2].reject(new NodicsError('ERR_STOREFRONT_00009'));
    await assert.rejects(failed, (error) => error.code === 'ERR_STOREFRONT_00009');
    await new Promise(resolve => setImmediate(resolve));
    assert.strictEqual(traffic.diagnostics().inFlightKeys, 0, 'failed in-flight work must be removed');

    assert.strictEqual(context.requestHostname({ host: 'electronics.nodics.com', query: { hostname: 'attacker.example.com' }, headers: { host: 'attacker.example.com', 'x-forwarded-host': 'forwarded.example.com' } }), 'electronics.nodics.com');
    properties.storefront.host.trustForwardedHost = false;
    assert.strictEqual(context.requestHostname({ httpRequest: { hostname: 'edge.nodics.com', headers: { 'x-forwarded-host': 'attacker.example.com' } } }), 'edge.nodics.com');
    properties.storefront.host.trustForwardedHost = true;
    assert.strictEqual(context.requestHostname({ httpRequest: { hostname: 'edge.nodics.com', headers: { 'x-forwarded-host': 'trusted.nodics.com' } } }), 'trusted.nodics.com');

    Object.assign(properties.storefront.traffic, originalTraffic);
    properties.storefront.host.trustForwardedHost = originalTrust;
    traffic.reset();
    console.log('Storefront traffic resilience contract validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
