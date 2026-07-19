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
    clientSafeMetadata: ['moduleName', 'instanceId', 'endpoint', 'state', 'lastSeenAt']
} : undefined };
global.SERVICE = {};
global.CLASSES = { NodicsError: class NodicsError extends Error {} };

const definition = require('../src/service/registry/defaultBackofficeRegistryService');
const service = Object.assign({}, definition, {
    _instances: new Map(),
    _metrics: { registrations: 0, renewals: 0, deregistrations: 0, expirations: 0, rejected: 0 },
    _sweepTimer: null
});

async function run() {
    let registration = {
        moduleName: 'cms', instanceId: 'cms-1', endpoint: 'http://cms:3040/nodics/cms',
        version: '1.0.0', capabilities: ['router'], secret: 'must-not-leak', leaseTtlMs: 20
    };
    let first = await service.register({ body: registration });
    assert.strictEqual(first.data.moduleName, 'cms');
    assert.strictEqual(first.data.secret, undefined);
    await service.register({ body: registration });
    assert.strictEqual(service._instances.size, 1, 'lease renewal must be idempotent');
    assert.strictEqual(service._metrics.renewals, 1);

    let list = await service.list();
    assert.strictEqual(list.data.modules.cms.length, 1);
    await assert.rejects(service.register({ body: { moduleName: 'cms', instanceId: 'bad', endpoint: 'file:///secret' } }));

    await service.deregister({ params: { instanceId: 'cms-1' }, body: { moduleName: 'cms' } });
    assert.strictEqual(service._instances.size, 0);

    await service.register({ body: registration });
    service._instances.get('cms:cms-1').expiresAt = Date.now() - 1;
    service.expireStale();
    assert.strictEqual(service._instances.size, 0);
    assert.strictEqual(service._metrics.expirations, 1);
    console.log('BackOffice registry service validated');
}

run().catch(error => { console.error(error); process.exit(1); });
