/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/**
 * @module backoffice/test/backofficeOperationalReadinessService
 * @description Validates deployment configuration invariants and stable READY, DEGRADED, and NOT_READY operational assessment.
 * @layer test
 * @owner backoffice
 */
const assert = require('assert');
let registry = require('../config/properties').backofficeRegistry;
global.CONFIG = { get: key => key === 'backofficeRegistry' ? registry : undefined };
let readinessContributor;
let publishedAlerts = [];
global.SERVICE = { AuditPublisher: { record: () => Promise.resolve(true) },
    AlertPublisher: { record: event => { publishedAlerts.push(event); return Promise.resolve(true); } },
    DefaultHealthService: { registerReadinessContributor: (name, contributor) => {
    assert.strictEqual(name, 'backofficeOperationalConfiguration'); readinessContributor = contributor;
} } };
const service = require('../src/service/operations/defaultBackofficeOperationalReadinessService');
service.init();
assert.strictEqual(readinessContributor.required, true);
assert.strictEqual(readinessContributor.check(), true);
assert.strictEqual(service.validateConfiguration().valid, true);
let ready = service.assess({ store: { available: true, metrics: {} }, availability: { queued: 0, metrics: {} }, discovery: {}, security: {} });
assert.strictEqual(ready.state, 'READY');
let degraded = service.assess({ store: { available: true, metrics: { errors: 1 } }, availability: { queued: 0,
    metrics: { attempts: 10, failures: 3 } }, discovery: { attempts: 10, failures: 3 }, security: { throttled: 1 } });
assert.strictEqual(degraded.state, 'DEGRADED');
assert(degraded.alerts.includes('REGISTRY_STORE_ERRORS'));
assert(degraded.alerts.includes('AVAILABILITY_FAILURE_RATE'));
assert(degraded.alerts.includes('DISCOVERY_FAILURE_RATE'));
assert(degraded.alerts.includes('ADMIN_REFRESH_THROTTLED'));
let originalStore = registry.store;
registry.store = Object.assign({}, originalStore, { mode: 'memory' });
registry.operations.requireDistributedStore = true;
assert.strictEqual(service.assess({ store: { available: true, metrics: {} } }).state, 'NOT_READY');
assert(service.validateConfiguration().failures.includes('DISTRIBUTED_STORE_REQUIRED'));
registry.operations.requireDistributedStore = false;
registry.store = originalStore;
assert.strictEqual(service.assess({ store: { available: false, metrics: {} } }).state, 'NOT_READY');
assert.strictEqual(service.assess({ store: { available: true, metrics: {} }, availability: { queued: 0, metrics: {} },
    discovery: {}, security: {} }).state, 'READY', 'provider recovery must restore readiness when alerts clear');
let originalThreshold = registry.operations.thresholds.availabilityFailurePercent;
registry.operations.thresholds.availabilityFailurePercent = 101;
assert(service.validateConfiguration().failures.includes('OPERATION_THRESHOLD_INVALID'));
registry.operations.thresholds.availabilityFailurePercent = originalThreshold;

async function validateDeliveryAndProductionPolicy() {
    registry.operations.alerts = { enabled: true, failClosed: true, requireAcknowledgement: true,
        publisherService: 'AlertPublisher' };
    service._lastPublishedSignature = null;
    assert.strictEqual(await service.publishAssessment(degraded), true);
    assert.strictEqual(publishedAlerts.length, 1);
    assert.deepStrictEqual(Object.keys(publishedAlerts[0]).sort(), ['alerts', 'checkedAt', 'eventType', 'state']);
    assert.strictEqual(await service.publishAssessment(degraded), false, 'unchanged alert state must be deduplicated');
    global.SERVICE.AlertPublisher.record = () => Promise.resolve(false);
    service._lastPublishedSignature = null;
    await assert.rejects(service.publishAssessment(degraded), error => error.code === 'ALERT_DELIVERY_UNACKNOWLEDGED');

    registry.operations.production.enabled = true;
    let productionFailures = service.validateConfiguration().failures;
    assert(productionFailures.includes('PRODUCTION_DISTRIBUTED_STORE_REQUIRED'));
    assert(productionFailures.includes('PRODUCTION_HTTPS_REQUIRED'));
    assert(productionFailures.includes('PRODUCTION_HOST_ALLOWLIST_REQUIRED'));
    assert(productionFailures.includes('PRODUCTION_AUDIT_DELIVERY_REQUIRED'));
    registry.store.mode = 'distributed';
    registry.allowedSchemes = ['https'];
    registry.discovery.allowedHosts = ['modules.internal.example'];
    registry.availability.allowedHosts = ['modules.internal.example'];
    registry.audit = { enabled: true, failClosed: true, requireAcknowledgement: true,
        publisherService: 'AuditPublisher' };
    assert.strictEqual(service.validateConfiguration().valid, true,
        'complete production security and delivery policy must qualify');
    registry.operations.production.enabled = false;
    console.log('BackOffice operational readiness service validated');
}

validateDeliveryAndProductionPolicy().catch(error => { console.error(error); process.exit(1); });
