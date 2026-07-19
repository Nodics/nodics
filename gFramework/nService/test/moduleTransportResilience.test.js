/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nService/test/moduleTransportResilience
 * @description Validates timeout, safe retry, unsafe-write, circuit-breaker,
 * pooling, diagnostics, and lifecycle-cleanup contracts for module HTTP calls.
 * @layer test
 * @owner nService
 * @override Later project modules may override transport policy while preserving bounded and observable failure behavior.
 */
const assert = require('assert');
const http = require('http');

let configuration = {
    timeoutMs: 30,
    retry: {
        maxAttempts: 2,
        baseDelayMs: 1,
        maxDelayMs: 2,
        jitterRatio: 0,
        statuses: [503],
        errorCodes: ['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT']
    },
    circuitBreaker: { enabled: true, failureThreshold: 2, recoveryTimeoutMs: 1000 },
    connectionPool: { keepAlive: true, keepAliveMsecs: 10, maxSockets: 4, maxFreeSockets: 2, timeoutMs: 1000 }
};

global.CONFIG = { get: key => key === 'serviceCommunication' ? configuration : 'application/json' };
global.CLASSES = {
    NodicsError: {
        cleanContext: context => context,
        enrich: (error, context) => Object.assign(error, { nodicsContext: context })
    }
};
global.SERVICE = {};

const definition = require('../src/service/module/defaultModuleService');

function createService() {
    return Object.assign({}, definition, {
        LOG: { debug: function () {} },
        _agents: null,
        _circuits: new Map(),
        _diagnostics: null
    });
}

async function run() {
    let attempts = { safe: 0, unsafe: 0, idempotent: 0, slow: 0 };
    let server = http.createServer((request, response) => {
        let name = request.url.substring(1);
        attempts[name]++;
        if (name === 'slow') return setTimeout(() => response.end('{}'), 100);
        if ((name === 'safe' || name === 'idempotent') && attempts[name] === 1) {
            response.statusCode = 503;
            return response.end('{}');
        }
        if (name === 'unsafe') {
            response.statusCode = 503;
            return response.end('{}');
        }
        response.setHeader('content-type', 'application/json');
        response.end('{"status":"ok"}');
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    let baseUri = 'http://127.0.0.1:' + server.address().port;
    let service = createService();

    let safe = await service.fetch({ method: 'GET', uri: baseUri + '/safe', headers: {}, json: true, nodicsContext: { moduleName: 'safe' } });
    assert.strictEqual(safe.status, 'ok');
    assert.strictEqual(attempts.safe, 2, 'safe reads should use bounded retry');

    await assert.rejects(service.fetch({ method: 'POST', uri: baseUri + '/unsafe', headers: {}, body: {}, json: true, nodicsContext: { moduleName: 'unsafe' } }));
    assert.strictEqual(attempts.unsafe, 1, 'unsafe writes must not retry without idempotency');

    let idempotent = await service.fetch({ method: 'POST', uri: baseUri + '/idempotent', headers: { 'Idempotency-Key': 'operation-1' }, body: {}, json: true, nodicsContext: { moduleName: 'idempotent' } });
    assert.strictEqual(idempotent.status, 'ok');
    assert.strictEqual(attempts.idempotent, 2, 'idempotent writes may retry');

    await assert.rejects(service.fetch({ method: 'GET', uri: baseUri + '/slow', headers: {}, json: true, maxAttempts: 1, nodicsContext: { moduleName: 'slow' } }), error => error.code === 'ETIMEDOUT');
    assert.strictEqual(service.getTransportDiagnostics().timeouts, 1);
    assert(service._agents.http.options.keepAlive, 'HTTP connections must use the governed pool');

    configuration.circuitBreaker.failureThreshold = 1;
    await assert.rejects(service.fetch({ method: 'POST', uri: baseUri + '/unsafe', headers: {}, body: {}, json: true, nodicsContext: { moduleName: 'open' } }));
    let beforeRejected = attempts.unsafe;
    await assert.rejects(service.fetch({ method: 'POST', uri: baseUri + '/unsafe', headers: {}, body: {}, json: true, nodicsContext: { moduleName: 'open' } }), error => error.code === 'EOPENBREAKER');
    assert.strictEqual(attempts.unsafe, beforeRejected, 'open circuits must fail without network traffic');

    await service.closeTransport();
    assert.strictEqual(service._agents, null);
    await new Promise(resolve => server.close(resolve));
    console.log('Module transport resilience validated');
}

run().catch(error => {
    console.error(error);
    process.exit(1);
});
