/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/**
 * @module backoffice/test/backofficeAvailabilityService
 * @description Validates bounded readiness observation, freshness, failure isolation, deduplication, and multi-instance aggregation.
 * @layer test
 * @owner backoffice
 */
const assert = require('assert');

let policy = { enabled: true, timeoutMs: 50, refreshIntervalMs: 1000, staleAfterMs: 5000,
    maxResponseBytes: 2048, allowRedirects: false, allowedHosts: ['module.example'],
    maxConcurrentObservations: 2, maxQueuedObservations: 1, failureBackoffMultiplier: 2, maxFailureBackoffMs: 5000,
    events: { enabled: true, emitInitialState: false, publisherService: 'DefaultEventService' } };
let response = { data: { status: 'UP', privateDetail: 'must-not-be-retained' } };
let fetchedRequest;
let publishedEvents = [];
global.CONFIG = { get: key => key === 'backofficeRegistry' ? { availability: policy } : key === 'defaultTenant' ? 'default' : undefined };
global.NODICS = { getNodeName: () => 'backoffice-node' };
global.ENUMS = { TargetType: { MODULE: { key: 'MODULE' } } };
global.SERVICE = {
    DefaultBackofficeDiscoveryService: { buildObservedUrl: (registration, path, hosts) => {
        assert.deepStrictEqual(hosts, ['module.example']);
        return 'https://module.example' + path;
    } },
    DefaultModuleService: {
        buildExternalRequest: options => Object.assign({}, options),
        fetch: request => { fetchedRequest = request; return response instanceof Error ? Promise.reject(response) : Promise.resolve(response); }
    },
    DefaultEventService: { publish: event => { publishedEvents.push(event); return Promise.resolve(true); } }
};
const definition = require('../src/service/availability/defaultBackofficeAvailabilityService');
const service = Object.assign({}, definition, { _observations: new Map(), _inflight: new Map(), _moduleStates: new Map(),
    _moduleTransitions: new Map(), _instanceModules: new Map(), _moduleRegistrations: new Map(),
    _queue: [], _activeObservations: 0,
    _metrics: { attempts: 0, successes: 0, failures: 0, readinessFailures: 0, transportFailures: 0,
        timeouts: 0, staleReads: 0, suppressedRefreshes: 0, inflightDeduplications: 0, queued: 0,
        queueRejected: 0, maxConcurrentObserved: 0, transitions: 0,
        publicationAttempts: 0, publicationSuccesses: 0, publicationFailures: 0, totalDurationMs: 0,
        maxDurationMs: 0, lastDurationMs: 0, lastSuccessAt: null, lastFailureAt: null, lastFailureCode: null } });
const registration = instanceId => ({ moduleName: 'cms', instanceId: instanceId, clientCallable: true,
    endpoint: 'https://module.example/nodics/cms', healthPath: '/nodics/system/v0/health/ready',
    environment: 'local', server: 'cms-server', node: 'cms-node' });

async function run() {
    let observed = await service.observe(registration('one'));
    assert.strictEqual(observed.state, 'UP');
    assert.strictEqual(fetchedRequest.timeoutMs, 50);
    assert.strictEqual(fetchedRequest.maxResponseBytes, 2048);
    assert.strictEqual(fetchedRequest.followRedirects, false);
    assert.strictEqual(observed.privateDetail, undefined, 'raw readiness responses must not be retained');
    assert.strictEqual(publishedEvents.length, 0, 'initial readiness must not create a startup event storm');

    response = { data: { status: 'DOWN' } };
    observed = await service.observe(registration('one'));
    await new Promise(resolve => setImmediate(resolve));
    assert.strictEqual(publishedEvents.length, 1, 'a real state change must publish exactly once');
    assert.strictEqual(publishedEvents[0].data.moduleName, 'cms');
    assert.strictEqual(publishedEvents[0].data.previousState, 'UP');
    assert.strictEqual(publishedEvents[0].data.currentState, 'UNAVAILABLE');
    assert.strictEqual(publishedEvents[0].data.unavailableInstances, 1);
    assert.strictEqual(publishedEvents[0].data.endpoint, undefined, 'events must not disclose target endpoints');
    await service.observe(registration('one'));
    await new Promise(resolve => setImmediate(resolve));
    assert.strictEqual(publishedEvents.length, 1, 'unchanged state must be deduplicated');

    response = { data: { status: 'UP' } };
    await service.observe(registration('one'));
    await new Promise(resolve => setImmediate(resolve));
    assert.strictEqual(publishedEvents.length, 2, 'recovery must publish one state transition');

    response = new Error('connection refused');
    observed = await service.observe(registration('two'));
    assert.strictEqual(observed.state, 'UNAVAILABLE');
    let aggregate = service.getModuleAvailability([{ instanceId: 'one' }, { instanceId: 'two' }]);
    assert.deepStrictEqual(aggregate, { state: 'DEGRADED', activeInstances: 2, healthyInstances: 1,
        unavailableInstances: 1, unknownInstances: 0 });
    assert.strictEqual(service.getModuleAvailability([{ instanceId: 'two' }]).state, 'UNAVAILABLE');
    assert.strictEqual(service.getModuleAvailability([{ instanceId: 'missing' }]).state, 'UNKNOWN');

    service._observations.get('one').observedAt = new Date(Date.now() - 6000).toISOString();
    assert.strictEqual(service.getModuleAvailability([{ instanceId: 'one' }, { instanceId: 'two' }]).state, 'UNKNOWN');
    response = { data: { status: 'UP' } };
    assert.strictEqual(await service.scheduleObservation(registration('two')), false, 'fresh observations must suppress duplicate polling');
    response = Object.assign(new Error('timed out'), { code: 'ETIMEDOUT' });
    await service.observe(registration('timeout'));
    assert.strictEqual(service.getDiagnostics().metrics.timeouts, 1);
    assert.strictEqual(service.getDiagnostics().metrics.suppressedRefreshes, 1);
    assert.strictEqual(service.getDiagnostics().metrics.staleReads, 1);
    assert.strictEqual(service.getDiagnostics().metrics.publicationSuccesses, 3);
    assert(service.getDiagnostics().metrics.totalDurationMs >= service.getDiagnostics().metrics.maxDurationMs);
    response = { data: { status: 'UP' } };
    await service.observe(registration('one'));
    await new Promise(resolve => setImmediate(resolve));
    SERVICE.DefaultEventService.publish = () => Promise.reject(new Error('publisher unavailable'));
    response = { data: { status: 'DOWN' } };
    await service.observe(registration('one'));
    await new Promise(resolve => setImmediate(resolve));
    assert.strictEqual(service.getDiagnostics().metrics.publicationFailures, 1, 'publisher failure must remain fail-open and observable');
    let activeFetches = 0;
    let maxActiveFetches = 0;
    response = { data: { status: 'UP' } };
    SERVICE.DefaultModuleService.fetch = request => new Promise(resolve => {
        activeFetches++;
        maxActiveFetches = Math.max(maxActiveFetches, activeFetches);
        setImmediate(() => { activeFetches--; resolve(response); });
    });
    await Promise.all(['queue-1', 'queue-2', 'queue-3', 'queue-overflow'].map(instanceId => service.scheduleObservation(registration(instanceId))));
    assert(maxActiveFetches <= 2, 'availability work must respect the process concurrency ceiling');
    assert(service.getDiagnostics().metrics.queued >= 1, 'excess observations must use the bounded queue');
    assert.strictEqual(service.getDiagnostics().metrics.queueRejected, 1, 'queue overflow must fail open without creating more work');
    service.removeInstance('two');
    assert.strictEqual(service.getDiagnostics().trackedInstances, 5);
    assert.strictEqual(service.reconcileActiveInstances(['one']), 4, 'orphaned process observations must be removed');
    console.log('BackOffice availability service validated');
}
run().catch(error => { console.error(error); process.exit(1); });
