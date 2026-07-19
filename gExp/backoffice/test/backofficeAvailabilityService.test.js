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
    maxResponseBytes: 2048, allowRedirects: false, allowedHosts: ['module.example'] };
let response = { data: { status: 'UP', privateDetail: 'must-not-be-retained' } };
let fetchedRequest;
global.CONFIG = { get: key => key === 'backofficeRegistry' ? { availability: policy } : undefined };
global.SERVICE = {
    DefaultBackofficeDiscoveryService: { buildObservedUrl: (registration, path, hosts) => {
        assert.deepStrictEqual(hosts, ['module.example']);
        return 'https://module.example' + path;
    } },
    DefaultModuleService: {
        buildExternalRequest: options => Object.assign({}, options),
        fetch: request => { fetchedRequest = request; return response instanceof Error ? Promise.reject(response) : Promise.resolve(response); }
    }
};
const definition = require('../src/service/availability/defaultBackofficeAvailabilityService');
const service = Object.assign({}, definition, { _observations: new Map(), _inflight: new Map(),
    _metrics: { attempts: 0, successes: 0, failures: 0, transitions: 0, lastSuccessAt: null, lastFailureAt: null, lastFailureCode: null } });
const registration = instanceId => ({ moduleName: 'cms', instanceId: instanceId, clientCallable: true,
    endpoint: 'https://module.example/nodics/cms', healthPath: '/nodics/system/v0/health/ready' });

async function run() {
    let observed = await service.observe(registration('one'));
    assert.strictEqual(observed.state, 'UP');
    assert.strictEqual(fetchedRequest.timeoutMs, 50);
    assert.strictEqual(fetchedRequest.maxResponseBytes, 2048);
    assert.strictEqual(fetchedRequest.followRedirects, false);
    assert.strictEqual(observed.privateDetail, undefined, 'raw readiness responses must not be retained');

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
    service.removeInstance('two');
    assert.strictEqual(service.getDiagnostics().trackedInstances, 1);
    console.log('BackOffice availability service validated');
}
run().catch(error => { console.error(error); process.exit(1); });
