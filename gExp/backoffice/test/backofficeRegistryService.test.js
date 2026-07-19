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
    modulePermissions: { cms: 'cms.backoffice.view' },
    compatibility: { registryContractVersion: 1, minimumClientContractVersion: 1 },
    clientSafeMetadata: ['moduleName', 'instanceId', 'endpoint', 'state', 'lastSeenAt']
} : undefined };
let storeDefinition = require('../src/service/registry/defaultBackofficeRegistryStoreService');
let store = Object.assign({}, storeDefinition, { _instances: new Map() });
global.SERVICE = { DefaultBackofficeRegistryStoreService: store };
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
        version: '1.0.0', capabilities: ['router'], clientCallable: true, secret: 'must-not-leak', leaseTtlMs: 20
    };
    let identity = { tokenType: 'service', runtimeInstanceId: 'cms-1', modules: ['cms'] };
    let first = await service.register({ body: registration, authData: identity });
    assert.strictEqual(first.data.moduleName, 'cms');
    assert.strictEqual(first.data.secret, undefined);
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
        registrations: [
            { moduleName: 'cms', instanceId: 'runtime-1', endpoint: 'http://cms/nodics/cms', clientCallable: true },
            { moduleName: 'workflowCore', instanceId: 'runtime-1', clientCallable: false, capabilities: ['service'] }
        ]
    }, authData: { tokenType: 'service', runtimeInstanceId: 'runtime-1', modules: ['cms', 'workflowCore'] } });
    assert.strictEqual(batch.data.registeredModules, 2);
    list = await service.list({ authData: { permissions: ['cms.backoffice.view'] } });
    assert.strictEqual(list.data.modules.workflowCore, undefined, 'non-API modules must not appear in client discovery');
    assert.strictEqual((await service.diagnostics()).data.activeInstances, 2, 'diagnostics must retain all active module leases');
    let bootstrap = await service.bootstrap({ authData: { permissions: ['cms.backoffice.view'] } });
    assert.strictEqual(bootstrap.data.compatibility.registryContractVersion, 1);
    assert.strictEqual(bootstrap.data.availability.cms.activeInstances, 1);

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
