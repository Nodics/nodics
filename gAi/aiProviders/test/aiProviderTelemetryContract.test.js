/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiProviders/test/AiProviderTelemetryContract
 * @description Verifies bounded sanitized provider metrics and optional degraded readiness.
 * @layer test
 * @owner aiProviders
 */
const assert = require('assert');
const defaults = require('../config/properties').aiProviders;
const telemetry = require('../src/service/observability/defaultAiProviderTelemetryService');
const operations = require('../src/service/operations/defaultAiProviderOperationsService');

const configuration = JSON.parse(JSON.stringify(defaults));
configuration.enabled = true;
configuration.observability.maximumSeries = 1;
configuration.providers.openAi = {
    enabled: true, secretReference: 'vault://ai/openai'
};
configuration.profiles.assistantGeneration.provider = 'openAi';
configuration.profiles.assistantGeneration.model = 'test-model';

telemetry.reset();
const first = telemetry.begin({
    profileCode: 'assistantGeneration', capability: 'GENERATION',
    providerCode: 'openAi', configuration: configuration
});
telemetry.failure(first, Object.assign(new Error('must not be exposed'), {
    code: 'AI_PROVIDER_QUOTA_EXCEEDED',
    providerDiagnostics: { category: 'QUOTA', retryable: false, status: 429 }
}), true);
const overflow = telemetry.begin({
    profileCode: 'knowledgeEmbedding', capability: 'EMBEDDING',
    providerCode: 'anotherProvider', configuration: configuration,
    attemptNumber: 2, fallback: true
});
telemetry.success(overflow, { usageReconciliation: { state: 'OVERAGE' } });

const snapshot = telemetry.snapshot();
assert.strictEqual(snapshot.activeSeries, 1);
assert.strictEqual(snapshot.overflowed, true);
assert.strictEqual(snapshot.series.length, 2);
assert.strictEqual(JSON.stringify(snapshot).includes('must not be exposed'), false);
assert.strictEqual(JSON.stringify(snapshot).includes('tenant'), false);
assert.strictEqual(JSON.stringify(snapshot).includes('principal'), false);
assert(snapshot.series.some(series => series.failuresByCategory.QUOTA === 1));
assert(snapshot.series.some(series => series.retries === 1 && series.fallbacks === 1));

const runtime = {
    configuration: configuration,
    gateway: { registrations: () => [{ providerCode: 'openAi', capabilities: ['GENERATION'] }] },
    rateLimitCache: { incrementBounded: () => ({ allowed: true }) },
    tokenLedger: { reserve: () => ({}) },
    telemetry: telemetry,
    secretResolver: () => Promise.resolve('resolved-secret')
};

operations.assess(runtime).then(readiness => {
    assert.strictEqual(readiness.state, 'DEGRADED');
    assert(readiness.failures.includes('PROVIDER_QUOTA_EXCEEDED'));
    assert.strictEqual(JSON.stringify(readiness).includes('resolved-secret'), false);
    telemetry.reset();
    return operations.assess(runtime);
}).then(readiness => {
    assert.strictEqual(readiness.state, 'READY');
    return operations.diagnostics({}, runtime);
}).then(diagnostics => {
    assert.strictEqual(diagnostics.readiness.state, 'READY');
    assert.strictEqual(Array.isArray(diagnostics.telemetry.series), true);
    console.log('AI provider telemetry and readiness contract validated');
});
