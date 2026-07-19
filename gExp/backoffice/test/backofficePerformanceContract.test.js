/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/**
 * @module backoffice/test/backofficePerformanceContract
 * @description Provides deterministic scale-path evidence for registration, registry scans, availability deduplication/concurrency, and refresh idempotency.
 * @layer test
 * @owner backoffice
 * @override Projects may increase workloads or add environment load tests while preserving structural performance budgets.
 */
const assert = require('assert');
const properties = require('../config/properties').backofficeRegistry;
const budget = properties.benchmark;
const elapsedMs = started => Number(process.hrtime.bigint() - started) / 1000000;
global.CONFIG = { get: key => key === 'backofficeRegistry' ? properties : key === 'defaultTenant' ? 'default' : undefined };
global.CLASSES = { NodicsError: class NodicsError extends Error {} };

let records = new Map();
let scans = 0;
const store = {
    get: async key => records.get(key),
    set: async (key, value) => { records.set(key, value); return value; },
    deleteIfExpiresAt: async () => false,
    values: async () => { scans++; return Array.from(records.entries()).map(([key, value]) => ({ key, value })); },
    diagnostics: () => ({ available: true }), size: async () => records.size
};
const registryDefinition = require('../src/service/registry/defaultBackofficeRegistryService');
const registry = Object.assign({}, registryDefinition, { _store: store,
    _metrics: { registrations: 0, renewals: 0, deregistrations: 0, expirations: 0, rejected: 0 }, _sweepTimer: null });
let discoverySchedules = 0;
global.SERVICE = {
    DefaultBackofficeContractService: require('../src/service/contract/defaultBackofficeContractService'),
    DefaultBackofficeAdministrativeSecurityService: { validate: () => true },
    DefaultBackofficeAuditService: { record: async () => true },
    DefaultBackofficeDiscoveryService: { scheduleDiscovery: () => { discoverySchedules++; return new Promise(() => {}); },
        reconcileActiveModules: () => 0 },
    DefaultBackofficeAvailabilityService: { scheduleObservation: () => Promise.resolve(false), reconcileActiveInstances: () => 0,
        getModuleAvailability: instances => ({ state: 'UP', activeInstances: instances.length, healthyInstances: instances.length,
            unavailableInstances: 0, unknownInstances: 0 }) }
};

async function run() {
    let modules = Array.from({ length: budget.registrationModules }, (_, index) => 'module' + index);
    let registrationStarted = process.hrtime.bigint();
    let registered = await registry.registerBatch({ instanceId: 'runtime-benchmark', environment: 'benchmark', server: 'benchmark-server',
        registrations: modules.map(moduleName => ({ moduleName, instanceId: 'runtime-benchmark', clientCallable: false })) },
    { tokenType: 'service', runtimeInstanceId: 'runtime-benchmark', modules });
    let registrationMs = elapsedMs(registrationStarted);
    assert.strictEqual(registered.data.registeredModules, budget.registrationModules);
    assert.strictEqual(discoverySchedules, budget.registrationModules, 'registration must schedule discovery without awaiting it');

    records.clear();
    let now = Date.now();
    for (let index = 0; index < budget.registryLeases; index++) {
        let moduleName = 'module' + (index % 250);
        records.set(moduleName + ':instance' + index, { moduleName, instanceId: 'instance' + index, version: '1', moduleKind: 'capability',
            capabilities: ['service'], clientCallable: true, environment: 'benchmark', server: 'server' + (index % 8),
            state: 'UP', lastSeenAt: new Date(now).toISOString(), expiresAt: now + 60000 });
    }
    scans = 0;
    let adminStarted = process.hrtime.bigint();
    let inventory = await registry.adminList({ tenant: 'default', authData: { tokenType: 'access', principalId: 'benchmark', tenant: 'default' },
        query: { environment: 'benchmark', limit: String(budget.maxAdminResultPage) } });
    let adminMs = elapsedMs(adminStarted);
    assert.strictEqual(inventory.data.items.length, budget.maxAdminResultPage);
    assert(scans <= budget.maxAdminStoreScans, 'administrative inventory must remain within the store-scan budget');

    let fetches = 0;
    let activeFetches = 0;
    let maxActiveFetches = 0;
    global.SERVICE = {
        DefaultBackofficeDiscoveryService: { buildObservedUrl: () => 'https://module.example/ready' },
        DefaultModuleService: { buildExternalRequest: options => options, fetch: () => new Promise(resolve => {
            fetches++; activeFetches++; maxActiveFetches = Math.max(maxActiveFetches, activeFetches);
            setImmediate(() => { activeFetches--; resolve({ data: { status: 'UP' } }); });
        }) }
    };
    const availabilityDefinition = require('../src/service/availability/defaultBackofficeAvailabilityService');
    const availability = Object.assign({}, availabilityDefinition, { _observations: new Map(), _inflight: new Map(), _moduleStates: new Map(),
        _moduleTransitions: new Map(), _instanceModules: new Map(), _moduleRegistrations: new Map(), _queue: [], _activeObservations: 0,
        _metrics: Object.assign({}, availabilityDefinition._metrics) });
    await Promise.all(Array.from({ length: budget.hostedModulesPerInstance }, (_, index) => availability.scheduleObservation({
        moduleName: 'hosted' + index, instanceId: 'shared-runtime', clientCallable: true, endpoint: 'https://module.example' })));
    assert.strictEqual(fetches, budget.maxAvailabilityProbesPerInstance, 'hosted modules must share one runtime readiness probe');
    assert(maxActiveFetches <= properties.availability.maxConcurrentObservations);

    global.SERVICE = {};
    const securityDefinition = require('../src/service/security/defaultBackofficeAdministrativeSecurityService');
    const security = Object.assign({}, securityDefinition, { _counters: new Map(), _inflight: new Map(), _results: new Map() });
    let refreshExecutions = 0;
    let refreshRequest = { tenant: 'default', authData: { tokenType: 'access', tenant: 'default', principalId: 'benchmark' },
        headers: { 'idempotency-key': 'same-refresh' } };
    await Promise.all(Array.from({ length: budget.concurrentRefreshRequests }, () => security.executeRefresh(refreshRequest, 'cms', async () => {
        refreshExecutions++; await new Promise(resolve => setImmediate(resolve)); return true;
    })));
    assert.strictEqual(refreshExecutions, budget.maxRefreshExecutionsPerIdempotencyKey);

    console.log('BackOffice performance evidence validated: registrationModules=' + budget.registrationModules +
        ', registryLeases=' + budget.registryLeases + ', hostedModules=' + budget.hostedModulesPerInstance +
        ', registrationMs=' + registrationMs.toFixed(3) + ', adminListMs=' + adminMs.toFixed(3) +
        ', adminStoreScans=' + scans + ', availabilityFetches=' + fetches + ', refreshExecutions=' + refreshExecutions);
}
run().catch(error => { console.error(error); process.exit(1); });
