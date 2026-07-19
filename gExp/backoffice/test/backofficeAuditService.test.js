/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module backoffice/test/backofficeAuditService
 * @description Validates BackOffice audit field allowlisting, secret redaction, publisher delegation, and disabled behavior.
 * @layer test
 * @owner backoffice
 */
const assert = require('assert');
let configuration = { audit: { enabled: true, failClosed: true, requireAcknowledgement: true, publisherService: 'AuditPublisher' } };
let published;
global.CONFIG = { get: key => key === 'backofficeRegistry' ? configuration : undefined };
global.SERVICE = { AuditPublisher: { record: event => { published = event; return Promise.resolve(event); } } };
const service = Object.assign({}, require('../src/service/audit/defaultBackofficeAuditService'), { LOG: { info: () => {} } });

async function run() {
    await service.record({ eventType: 'backoffice.registry.registration', outcome: 'rejected', reasonCode: 'IDENTITY_MISMATCH',
        moduleName: 'cms', instanceId: 'runtime-1', moduleCount: 1, token: 'must-not-leak', credential: 'must-not-leak' });
    assert.strictEqual(published.moduleName, 'cms');
    assert.strictEqual(published.token, undefined);
    assert.strictEqual(published.credential, undefined);
    assert(published.occurredAt);
    global.SERVICE.AuditPublisher.record = () => Promise.resolve(false);
    await assert.rejects(service.record({ eventType: 'unacknowledged' }), error => error.code === 'AUDIT_DELIVERY_UNACKNOWLEDGED');
    delete global.SERVICE.AuditPublisher;
    await assert.rejects(service.record({ eventType: 'unavailable' }), /publisher is unavailable/);
    configuration.audit.enabled = false;
    assert.strictEqual(await service.record({ eventType: 'ignored' }), false);
    console.log('BackOffice audit service validated');
}
run().catch(error => { console.error(error); process.exit(1); });
