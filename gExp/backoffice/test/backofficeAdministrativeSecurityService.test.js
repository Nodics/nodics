/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/**
 * @module backoffice/test/backofficeAdministrativeSecurityService
 * @description Validates human/service separation, tenant isolation, refresh throttling, idempotency, and bounded state.
 * @layer test
 * @owner backoffice
 */
const assert = require('assert');
let policy = { rejectServiceTokens: true, requirePrincipal: true, refreshWindowMs: 60000,
    refreshMaxPerWindow: 2, idempotencyTtlMs: 60000, maxIdempotencyEntries: 2 };
global.CONFIG = { get: key => key === 'backofficeRegistry' ? { administration: policy } : undefined };
global.CLASSES = { NodicsError: class NodicsError extends Error {} };
let audits = [];
global.SERVICE = { DefaultBackofficeAuditService: { record: event => { audits.push(event); return Promise.resolve(event); } } };
const definition = require('../src/service/security/defaultBackofficeAdministrativeSecurityService');
const service = Object.assign({}, definition, { _counters: new Map(), _inflight: new Map(), _results: new Map() });
const request = (principal, idempotencyKey) => ({ tenant: 'tenant-a', authData: { tokenType: 'access', tenant: 'tenant-a', principalId: principal },
    requestId: 'request-1', correlationId: 'correlation-1', headers: idempotencyKey ? { 'idempotency-key': idempotencyKey } : {} });

async function run() {
    assert.throws(() => service.validate({ tenant: 'tenant-a', authData: { tokenType: 'service', tenant: 'tenant-a', principalId: 'runtime' } }));
    assert.throws(() => service.validate({ tenant: 'tenant-a', authData: { tokenType: 'access', tenant: 'tenant-b', principalId: 'admin' } }));
    assert.throws(() => service.validate({ tenant: 'tenant-a', authData: { tokenType: 'access', tenant: 'tenant-a' } }));
    assert.strictEqual(service.getAuditContext(request('admin')).correlationId, 'correlation-1');
    let executions = 0;
    let first = await service.executeRefresh(request('admin', 'same'), 'cms', async () => ({ executions: ++executions }));
    let replay = await service.executeRefresh(request('admin', 'same'), 'cms', async () => ({ executions: ++executions }));
    assert.deepStrictEqual(replay, first, 'completed idempotent refresh must reuse the bounded result');
    await service.executeRefresh(request('admin'), 'cms', async () => true);
    assert.throws(() => service.executeRefresh(request('admin'), 'cms', async () => true), /ERR_RTR_00004/);
    await service.executeRefresh(request('other', 'other-1'), 'cms', async () => true);
    await service.executeRefresh(request('other', 'other-2'), 'cms', async () => true);
    await service.executeRefresh(request('third', 'other-3'), 'cms', async () => true);
    assert(service._results.size <= 2, 'idempotency results must remain bounded');
    await new Promise(resolve => setImmediate(resolve));
    assert(audits.some(event => event.reasonCode === 'SERVICE_IDENTITY_FORBIDDEN'));
    assert(audits.some(event => event.reasonCode === 'TENANT_MISMATCH'));
    assert(audits.some(event => event.reasonCode === 'REFRESH_RATE_LIMITED'));
    console.log('BackOffice administrative security service validated');
}
run().catch(error => { console.error(error); process.exit(1); });
