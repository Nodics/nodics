/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module backoffice/test/backofficeRegistryService
 * @description Validates idempotent leases, safe discovery projection, expiry, deregistration, and invalid registration rejection.
 * @layer test
 * @owner backoffice
 * @override Project registry storage implementations must preserve these observed-state invariants.
 */
const assert = require('assert');

global.CONFIG = { get: key => key === 'backofficeRegistry' ? {
    leaseTtlMs: 20,
    sweepIntervalMs: 1000,
    allowedSchemes: ['http', 'https'],
    requireBoundServiceIdentity: true,
    modulePermissions: {},
    compatibility: { registryContractVersion: 1, minimumClientContractVersion: 1 },
    clientSafeMetadata: ['moduleName', 'instanceId', 'endpoint', 'state', 'lastSeenAt', 'backoffice']
} : undefined };
let storeDefinition = require('../src/service/registry/defaultBackofficeRegistryStoreService');
let store = Object.assign({}, storeDefinition, { _instances: new Map() });
let contractService = require('../src/service/contract/defaultBackofficeContractService');
let auditEvents = [];
let discoveryAuthData = [];
let diagnosticsAuthData;
let availabilitySchedules = [];
global.SERVICE = {
    DefaultBackofficeRegistryStoreService: store,
    DefaultBackofficeContractService: contractService,
    DefaultBackofficeAuditService: { record: event => { auditEvents.push(event); return Promise.resolve(event); } },
    DefaultBackofficeContractRepositoryService: { getOperationalDiagnostics: request => {
        diagnosticsAuthData = request && request.authData;
        return Promise.resolve({ persistenceStatus: 'AVAILABLE', pendingApprovals: 1, activeSelections: 2 });
    } },
    DefaultBackofficeAvailabilityService: {
        scheduleObservation: registration => { availabilitySchedules.push(registration.instanceId); return Promise.resolve(true); },
        getModuleAvailability: instances => ({ state: 'UP', activeInstances: instances.length, healthyInstances: instances.length,
            unavailableInstances: 0, unknownInstances: 0 }),
        getDiagnostics: () => ({ trackedInstances: 1, inflight: 0, metrics: {} }),
        removeInstance: () => true
    },
    DefaultBackofficeDiscoveryService: {
        scheduleDiscovery: (registration, authData) => { discoveryAuthData.push(authData); return Promise.resolve(true); },
        getSnapshot: moduleName => moduleName === 'cms' ? { moduleName: 'cms', hash: 'contract-hash', operations: [] } : undefined,
        getDiagnostics: () => ({ attempts: 1, successes: 1 })
    }
};
global.CLASSES = { NodicsError: class NodicsError extends Error {} };

const definition = require('../src/service/registry/defaultBackofficeRegistryService');
const service = Object.assign({}, definition, {
    _store: store,
    _metrics: { registrations: 0, renewals: 0, deregistrations: 0, expirations: 0, rejected: 0 },
    _sweepTimer: null
});

async function run() {
    let registration = {
        moduleName: 'cms', instanceId: 'cms-1', endpoint: 'http://cms:3040/nodics/cms',
        version: '1.0.0', capabilities: ['router'], clientCallable: true, leaseTtlMs: 1000,
        backoffice: { enabled: true, capabilityId: 'content-management', displayName: 'Content', category: 'content',
            contractVersion: 2, minimumClientContractVersion: 1, roles: ['UI_COMPOSITION_PROVIDER'],
            discovery: { openApiPath: '/nodics/system/v0/contract/openapi/internal', contractVersion: 1 },
            uiComposition: { site: 'nodicsBackOffice', catalog: 'nodicsBackOfficeContentCatalog',
                defaultPage: 'backofficeDashboard', fallbackMode: 'STATIC_RECOVERY_SHELL' },
            requiredPermissions: ['cms.backoffice.view'] }
    };
    let identity = { tokenType: 'service', runtimeInstanceId: 'cms-1', modules: ['cms'], userGroups: ['serviceAccountUserGroup'] };
    let first = await service.register({ body: registration, authData: identity });
    assert.strictEqual(first.data.moduleName, 'cms');
    assert.strictEqual(first.data.backoffice.capabilityId, 'content-management');
    await service.register({ body: registration, authData: identity });
    assert.strictEqual(store._instances.size, 1, 'lease renewal must be idempotent');
    assert.strictEqual(service._metrics.renewals, 1);

    let list = await service.list({ authData: { permissions: ['cms.backoffice.view'] } });
    assert.strictEqual(list.data.modules.cms.length, 1);
    assert.strictEqual((await service.list({ authData: { permissions: [] } })).data.modules.cms, undefined,
        'discovery must omit modules the caller is not authorized to use');
    await assert.rejects(service.register({
        body: { moduleName: 'cms', instanceId: 'bad', endpoint: 'file:///secret', clientCallable: true },
        authData: { tokenType: 'service', runtimeInstanceId: 'bad', modules: ['cms'] }
    }));
    await assert.rejects(service.register({ body: registration, authData: { tokenType: 'service', runtimeInstanceId: 'other', modules: ['cms'] } }));

    await assert.rejects(service.deregister({ params: { instanceId: 'cms-1' }, authData: {
        tokenType: 'service', runtimeInstanceId: 'other'
    } }));
    await service.deregister({ params: { instanceId: 'cms-1' }, body: { moduleName: 'cms' }, authData: identity });
    assert.strictEqual(store._instances.size, 0);

    await service.register({ body: registration, authData: identity });
    store._instances.get('cms:cms-1').expiresAt = Date.now() - 1;
    await service.expireStale();
    assert.strictEqual(store._instances.size, 0);
    assert.strictEqual(service._metrics.expirations, 1);

    let batch = await service.register({ body: {
        instanceId: 'runtime-1',
        environment: 'local',
        server: 'cms-server',
        node: 'cms-node',
        registrations: [
            { moduleName: 'cms', instanceId: 'runtime-1', endpoint: 'http://cms/nodics/cms', clientCallable: true,
                backoffice: registration.backoffice },
            { moduleName: 'workflowCore', instanceId: 'runtime-1', clientCallable: false, capabilities: ['service'] }
        ]
    }, authData: { tokenType: 'service', runtimeInstanceId: 'runtime-1', modules: ['cms', 'workflowCore'],
        userGroups: ['serviceAccountUserGroup'] } });
    assert.strictEqual(batch.data.registeredModules, 2);
    assert.deepStrictEqual({ environment: store._instances.get('cms:runtime-1').environment,
        server: store._instances.get('cms:runtime-1').server, node: store._instances.get('cms:runtime-1').node },
    { environment: 'local', server: 'cms-server', node: 'cms-node' }, 'runtime coordinates must remain available for sanitized telemetry');
    assert.deepStrictEqual(discoveryAuthData.slice(-2).map(authData => authData.userGroups),
        [['serviceAccountUserGroup'], ['serviceAccountUserGroup']], 'batch discovery must preserve authenticated service groups');
    assert(availabilitySchedules.includes('runtime-1'), 'client-callable batch registration must schedule availability observation');
    list = await service.list({ authData: { permissions: ['cms.backoffice.view'] } });
    assert.strictEqual(list.data.modules.workflowCore, undefined, 'non-API modules must not appear in client discovery');
    let diagnostics = await service.diagnostics({ authData: { userGroups: ['runtimeConfigAdminUserGroup'] } });
    assert.strictEqual(diagnostics.data.activeInstances, 2, 'diagnostics must retain all active module leases');
    assert.strictEqual(diagnostics.data.contracts.pendingApprovals, 1);
    assert.deepStrictEqual(diagnosticsAuthData.userGroups, ['runtimeConfigAdminUserGroup']);
    let bootstrap = await service.bootstrap({ authData: { permissions: ['cms.backoffice.view'] },
        headers: { 'x-nodics-client-contract-version': '1' } });
    assert.strictEqual(bootstrap.data.compatibility.registryContractVersion, 1);
    assert.strictEqual(bootstrap.data.compatibility.status, 'DEGRADED');
    assert.strictEqual(bootstrap.data.catalogue.cms.compatibility.status, 'DEGRADED');
    assert.strictEqual(service.evaluateCompatibility({ contractVersion: 2, minimumClientContractVersion: 2 }, 1).status, 'INCOMPATIBLE');
    assert.strictEqual(service.evaluateCompatibility({ contractVersion: 2, minimumClientContractVersion: 1 }, 2).status, 'COMPATIBLE');
    assert.strictEqual(bootstrap.data.availability.cms.activeInstances, 1);
    assert.strictEqual(bootstrap.data.availability.cms.state, 'UP');
    assert.strictEqual(bootstrap.data.catalogue.cms.contract.hash, 'contract-hash');
    assert.strictEqual(bootstrap.data.uiComposition.providerModule, 'cms');
    assert.strictEqual(bootstrap.data.uiComposition.fallbackMode, 'STATIC_RECOVERY_SHELL');
    await assert.rejects(() => Promise.resolve().then(() => service.bootstrap({ authData: { permissions: [] },
        headers: { 'x-nodics-client-contract-version': 'invalid' } })));
    assert(auditEvents.some(event => event.eventType === 'backoffice.registry.registration'));

    let sharedStoreDefinition = require('../src/service/registry/defaultBackofficeRegistryStoreService');
    let sharedStore = Object.assign({}, sharedStoreDefinition, { _instances: new Map() });
    let replicaOne = Object.assign({}, definition, { _store: sharedStore, _metrics: Object.assign({}, service._metrics) });
    let replicaTwo = Object.assign({}, definition, { _store: sharedStore, _metrics: Object.assign({}, service._metrics) });
    await replicaOne.register({ body: registration, authData: identity });
    assert.strictEqual((await replicaTwo.list({ authData: { permissions: ['cms.backoffice.view'] } })).data.modules.cms.length, 1,
        'registry replicas must reconcile through the configured shared store contract');
    console.log('BackOffice registry service validated');
}

run().catch(error => { console.error(error); process.exit(1); });
