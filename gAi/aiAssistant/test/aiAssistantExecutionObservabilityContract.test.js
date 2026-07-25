/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiAssistant/test/AiAssistantExecutionObservabilityContract
 * @description Verifies fixed-cardinality execution metrics, sanitized diagnostics, and optional readiness degradation.
 * @layer test
 * @owner aiAssistant
 */
const assert = require('assert');
const defaults = require('../config/properties').aiAssistant;
const telemetry = require('../src/service/observability/defaultAiAssistantExecutionTelemetryService');
const operations = require('../src/service/operations/defaultAiAssistantOperationsService');

telemetry.reset();
telemetry.record('claimsAttempted');
telemetry.record('claimsAcquired');
telemetry.record('heartbeatFailures', 'lastHeartbeatFailureAt');
telemetry.add('recoveryScanned', 2);

const snapshot = telemetry.snapshot();
assert.strictEqual(snapshot.claimsAttempted, 1);
assert.strictEqual(snapshot.recoveryScanned, 2);
assert.strictEqual(JSON.stringify(snapshot).includes('tenant-'), false);
assert.strictEqual(JSON.stringify(snapshot).includes('turn-'), false);
assert.throws(() => telemetry.record('tenant-a'), /Unknown AI Assistant metric/);

const runtime = {
    configuration: Object.assign({}, defaults, { enabled: true }),
    telemetry: telemetry,
    turns: { get: () => Promise.resolve({ result: [] }), update: () => Promise.resolve(true) },
    cache: { put: () => Promise.resolve(true) }
};

operations.assess(runtime)
    .then(readiness => {
        assert.strictEqual(readiness.state, 'DEGRADED');
        assert.deepStrictEqual(readiness.failures, ['RECENT_HEARTBEAT_FAILURE']);
        telemetry.reset();
        return operations.diagnostics({}, runtime);
    })
    .then(diagnostics => {
        assert.strictEqual(diagnostics.readiness.state, 'READY');
        assert.strictEqual(diagnostics.telemetry.claimsAttempted, 0);
        const disabled = Object.assign({}, runtime, {
            configuration: Object.assign({}, defaults, { enabled: false })
        });
        return operations.assess(disabled);
    })
    .then(readiness => {
        assert.strictEqual(readiness.state, 'DISABLED');
        console.log('AI Assistant execution observability contract validated');
    })
    .catch(error => {
        console.error(error);
        process.exitCode = 1;
    });
