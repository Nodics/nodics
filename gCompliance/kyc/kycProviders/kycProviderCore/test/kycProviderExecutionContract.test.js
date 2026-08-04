/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const assert = require('assert');
const service = require('../src/service/defaultKycProviderExecutionService');
const registry = require('../src/service/defaultKycProviderRegistryService');
describe('KYC provider execution resilience contract', function () {
    const originalConfig = global.CONFIG; const originalService = global.SERVICE; let attempts; let audits; let createCalls; let reconcileCalls;
    beforeEach(function () {
        attempts = []; audits = []; createCalls = 0; reconcileCalls = 0;
        const adapter = {}; registry.operations.forEach(operation => { adapter[operation] = async () => ({ providerCode: 'mockKyc', status: 'COMPLETED', decision: 'APPROVED' }); });
        adapter.createCase = async () => { createCalls += 1; throw Object.assign(new Error('timeout'), { code: 'KYC_PROVIDER_TIMEOUT', retryable: true }); };
        adapter.reconcileCase = async () => { reconcileCalls += 1; return { providerCode: 'mockKyc', providerCaseRef: 'safe-ref', status: 'COMPLETED', decision: 'APPROVED', reasonCode: 'RECONCILED' }; };
        global.CONFIG = { get: key => key === 'kyc.providerExecution' ? { defaultProvider: 'mockKyc', maxAttempts: 2, timeoutMs: 20, backoffMs: 0, maximumBackoffMs: 0 } : {} };
        global.SERVICE = {
            DefaultKycProviderExecutionAttemptService: { get: async () => ({ result: [] }), save: async input => { attempts.push(input.model); } },
            DefaultKycProviderService: { get: async () => ({ result: [{ providerCode: 'mockKyc', adapterService: 'Adapter', healthStatus: 'READY', sandboxSupported: true, productionReady: false }] }) },
            DefaultKycProviderExecutionPolicyService: { get: async () => ({ result: [{ providerCode: 'mockKyc', maxAttempts: 2, timeoutMs: 20, backoffMs: 0, liveCallsEnabled: false, retryableErrorCodes: ['KYC_PROVIDER_TIMEOUT'], nonRetryableErrorCodes: [] }] }) },
            DefaultKycProviderAccountService: { get: async () => ({ result: [{ providerAccountCode: 'account-1', liveCallsEnabled: false }] }) },
            DefaultKycRateLimitService: { enforce: async () => ({ allowed: true }) },
            DefaultKycProviderRegistryService: registry, Adapter: adapter,
            DefaultKycAuditService: { record: async (request, input) => audits.push(input) }
        };
    });
    afterEach(function () { global.CONFIG = originalConfig; global.SERVICE = originalService; });
    const request = () => ({ tenant: 't1', tenantCode: 't1', enterpriseCode: 'e1', environmentCode: 'sandbox', executionMode: 'SANDBOX', caseCode: 'case-1', idempotencyKey: 'idempotency-1', authData: { serviceName: 'kyc' } });
    it('reconciles an uncertain timeout before retrying provider mutation', async function () { const result = await service.execute(request(), 'createCase'); assert.strictEqual(result.decision, 'APPROVED'); assert.strictEqual(createCalls, 1); assert.strictEqual(reconcileCalls, 1); assert.deepStrictEqual(attempts.map(value => value.status), ['FAILED', 'SUCCEEDED']); assert.strictEqual(attempts[1].reconciliationPerformed, true); assert.ok(audits.some(value => value.operation === 'RECOVERED')); });
    it('fails closed for unqualified live execution', async function () { const input = request(); input.executionMode = 'LIVE'; await assert.rejects(() => service.execute(input, 'createCase'), error => error.code === 'KYC_LIVE_CALL_DISABLED'); });
    it('returns persisted successful evidence idempotently', async function () { global.SERVICE.DefaultKycProviderExecutionAttemptService.get = async () => ({ result: [{ status: 'SUCCEEDED', safeEvidence: { providerCode: 'mockKyc', decision: 'APPROVED' } }] }); const result = await service.execute(request(), 'createCase'); assert.strictEqual(result.idempotent, true); assert.strictEqual(createCalls, 0); });
    it('opens the persisted circuit after the configured failure threshold', async function () { let update; global.SERVICE.DefaultKycProviderExecutionAttemptService.get = async () => ({ result: [{ status: 'FAILED' }, { status: 'FAILED' }] }); global.SERVICE.DefaultKycProviderExecutionPolicyService.update = async input => { update = input; return { modifiedCount: 1 }; }; const opened = await service.openCircuitIfRequired(request(), 'mockKyc', { providerPolicyCode: 'policy-1', version: 4, circuitFailureThreshold: 2, circuitResetMs: 1000 }); assert.strictEqual(opened, true); assert.strictEqual(update.query.version, 4); assert.ok(update.model.$set.circuitOpenUntil instanceof Date); });
});
