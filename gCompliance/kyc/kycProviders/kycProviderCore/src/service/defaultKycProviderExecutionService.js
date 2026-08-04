/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module kycProviderCore/service/DefaultKycProviderExecutionService @description Executes provider operations with readiness, live guards, timeout, reconciliation, retry, failover, circuit, idempotency, and safe evidence. @layer service @owner kycProviderCore @override Later modules may replace selection and resilience policy while preserving bounded evidence and fail-closed live execution. */
const crypto = require('crypto');
const list = value => value && Array.isArray(value.result) ? value.result : Array.isArray(value) ? value : [];
const fail = (message, code, retryable) => Object.assign(new Error(message), { code, retryable: retryable === true });
module.exports = {
    init: () => Promise.resolve(true), postInit: () => Promise.resolve(true),
    /**
     * Executes the one operation within the kycProviderCore-owned layered contract.
     *
     * @param {*} service Value defined by the surrounding Nodics operation contract.
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} query Value defined by the surrounding Nodics operation contract.
     * @param {*} label Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    one: async function (service, request, query, label) { const values = list(await service.get({ tenant: request.tenant, authData: request.authData, query, searchOptions: { limit: 2 } }, {})); if (values.length !== 1) throw fail(`${label} is unavailable.`, 'KYC_PROVIDER_UNAVAILABLE'); return values[0]; },
    /**
     * Executes the timeout operation within the kycProviderCore-owned layered contract.
     *
     * @param {*} work Value defined by the surrounding Nodics operation contract.
     * @param {*} timeoutMs Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    timeout: async function (work, timeoutMs) { let timer; try { return await Promise.race([Promise.resolve().then(work), new Promise((resolve, reject) => { timer = setTimeout(() => reject(fail('KYC provider timed out.', 'KYC_PROVIDER_TIMEOUT', true)), timeoutMs); })]); } finally { clearTimeout(timer); } },
    /**
     * Executes the audit operation within the kycProviderCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} operation Value defined by the surrounding Nodics operation contract.
     * @param {*} outcome Value defined by the surrounding Nodics operation contract.
     * @param {*} evidence Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    audit: async function (request, operation, outcome, evidence) { if (!SERVICE.DefaultKycAuditService) return; await SERVICE.DefaultKycAuditService.record(request, { operation, outcome, permissionCode: 'kyc.provider.execute', correlationId: `${request.correlationId || request.caseCode}:${evidence.providerCode}:${evidence.operation}:${evidence.attempt}`, safeEvidence: evidence }); },
    /**
     * Executes the module artifact within the kycProviderCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} operation Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    execute: async function (request, operation) {
        const configured = CONFIG.get('kyc.providerExecution') || {}; const primary = request.providerCode || configured.defaultProvider; const candidates = [primary, ...(request.failoverProviderCodes || configured.failoverProviderCodes || [])].filter((value, index, values) => value && values.indexOf(value) === index); if (!candidates.length) throw fail('No KYC provider is configured.', 'KYC_PROVIDER_UNAVAILABLE');
        const identity = crypto.createHash('sha256').update([request.tenantCode, request.enterpriseCode, request.caseCode, operation, request.idempotencyKey || request.caseCode].join('|')).digest('hex');
        const completed = list(await SERVICE.DefaultKycProviderExecutionAttemptService.get({ tenant: request.tenant, authData: request.authData, query: { executionIdentityHash: identity, status: 'SUCCEEDED' }, searchOptions: { limit: 2 } }, {})); if (completed.length) return Object.assign({ idempotent: true }, completed[0].safeEvidence);
        let lastError;
        for (const providerCode of candidates) {
            const provider = await this.one(SERVICE.DefaultKycProviderService, request, { providerCode, tenantCode: request.tenantCode, enterpriseCode: request.enterpriseCode, status: 'ACTIVE' }, 'KYC provider');
            const policy = await this.one(SERVICE.DefaultKycProviderExecutionPolicyService, request, { providerCode, tenantCode: request.tenantCode, enterpriseCode: request.enterpriseCode, status: 'ACTIVE' }, 'KYC provider policy');
            const account = await this.one(SERVICE.DefaultKycProviderAccountService, request, { providerCode, tenantCode: request.tenantCode, enterpriseCode: request.enterpriseCode, status: 'ACTIVE', environment: request.environmentCode || 'sandbox' }, 'KYC provider account');
            await SERVICE.DefaultKycRateLimitService.enforce('provider', Object.assign({}, request, { providerCode, providerAccountCode: account.providerAccountCode }));
            if (provider.healthStatus !== 'READY' || policy.circuitOpenUntil && new Date(policy.circuitOpenUntil).getTime() > Date.now()) { lastError = fail('KYC provider circuit or readiness is unavailable.', 'KYC_PROVIDER_UNAVAILABLE', true); continue; }
            const mode = String(request.executionMode || 'SANDBOX').toUpperCase(); if (mode === 'LIVE') SERVICE.DefaultKycProviderRegistryService.assertLiveCallAllowed(provider, { liveCallsEnabled: policy.liveCallsEnabled === true && account.liveCallsEnabled === true }); else if (provider.sandboxSupported !== true) { lastError = fail('KYC provider sandbox is unavailable.', 'KYC_PROVIDER_UNAVAILABLE'); continue; }
            const adapter = SERVICE[provider.adapterService]; SERVICE.DefaultKycProviderRegistryService.assertAdapter(adapter); const maxAttempts = Math.max(1, Number(policy.maxAttempts || configured.maxAttempts || 1));
            for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
                let reconciliationPerformed = false; const started = Date.now();
                try {
                    if (attempt > 1 && lastError && lastError.code === 'KYC_PROVIDER_TIMEOUT') { reconciliationPerformed = true; const reconciled = SERVICE.DefaultKycProviderRegistryService.normalizeEvidence(await this.timeout(() => adapter.reconcileCase(Object.assign({}, request, { providerCode, providerAccount: account })), Number(policy.timeoutMs || configured.timeoutMs || 10000))); if (['APPROVED', 'REJECTED', 'MANUAL_REVIEW_REQUIRED'].includes(reconciled.decision)) { await this.persistAttempt(request, { identity, providerCode, account, operation, attempt, mode, started, reconciliationPerformed, status: 'SUCCEEDED', resultCode: reconciled.reasonCode || reconciled.decision, safeEvidence: reconciled }); await this.audit(request, 'RECOVERED', reconciled.decision, { providerCode, operation, attempt, reconciliationPerformed: true }); return reconciled; } }
                    const evidence = SERVICE.DefaultKycProviderRegistryService.normalizeEvidence(await this.timeout(() => adapter[operation](Object.assign({}, request, { providerCode, providerAccount: account })), Number(policy.timeoutMs || configured.timeoutMs || 10000)));
                    await this.persistAttempt(request, { identity, providerCode, account, operation, attempt, mode, started, reconciliationPerformed, status: 'SUCCEEDED', resultCode: evidence.reasonCode || evidence.decision || evidence.status, safeEvidence: evidence }); await this.audit(request, 'PROVIDER_EXECUTED', 'SUCCEEDED', { providerCode, operation, attempt }); return evidence;
                } catch (errorValue) {
                    lastError = errorValue; const retryable = errorValue.retryable === true || (policy.retryableErrorCodes || []).includes(errorValue.code) || errorValue.code === 'KYC_PROVIDER_TIMEOUT'; if ((policy.nonRetryableErrorCodes || []).includes(errorValue.code)) lastError.retryable = false;
                    await this.persistAttempt(request, { identity, providerCode, account, operation, attempt, mode, started, reconciliationPerformed, status: 'FAILED', resultCode: errorValue.code || 'KYC_PROVIDER_UNAVAILABLE', retryable, safeEvidence: { providerCode, operation, errorCode: errorValue.code || 'KYC_PROVIDER_UNAVAILABLE' } }); await this.openCircuitIfRequired(request, providerCode, policy); await this.audit(request, retryable ? 'RETRIED' : 'FAILED', errorValue.code || 'KYC_PROVIDER_UNAVAILABLE', { providerCode, operation, attempt, retryable });
                    if (!retryable) break; const delay = Math.min(Number(policy.backoffMs || configured.backoffMs || 0) * Math.pow(2, attempt - 1), Number(configured.maximumBackoffMs || 30000)); if (delay > 0) await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        throw lastError || fail('KYC provider execution failed.', 'KYC_PROVIDER_UNAVAILABLE');
    },
    /**
     * Executes the persist attempt operation within the kycProviderCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} value Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    persistAttempt: async function (request, value) { const model = { executionAttemptCode: `kyc-execution-${crypto.randomUUID()}`, executionIdentityHash: value.identity, tenantCode: request.tenantCode, enterpriseCode: request.enterpriseCode, caseCode: request.caseCode, providerCode: value.providerCode, providerAccountCode: value.account.providerAccountCode, operation: value.operation, attemptNumber: value.attempt, executionMode: value.mode, resultCode: value.resultCode, safeEvidence: value.safeEvidence, retryable: value.retryable === true, reconciliationPerformed: value.reconciliationPerformed === true, startedAt: new Date(value.started), completedAt: new Date(), latencyMs: Date.now() - value.started, status: value.status, version: 1 }; await SERVICE.DefaultKycProviderExecutionAttemptService.save({ tenant: request.tenant, authData: request.authData, model }); return model; },
    /**
     * Executes the open circuit if required operation within the kycProviderCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} providerCode Value defined by the surrounding Nodics operation contract.
     * @param {*} policy Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    openCircuitIfRequired: async function (request, providerCode, policy) { const threshold = Math.max(1, Number(policy.circuitFailureThreshold || 5)); const failures = list(await SERVICE.DefaultKycProviderExecutionAttemptService.get({ tenant: request.tenant, authData: request.authData, query: { providerCode, tenantCode: request.tenantCode, enterpriseCode: request.enterpriseCode, status: 'FAILED' }, searchOptions: { limit: threshold, sort: { completedAt: -1 } } }, {})); if (failures.length < threshold || policy.version === undefined) return false; const openUntil = new Date(Date.now() + Number(policy.circuitResetMs || 60000)); const result = await SERVICE.DefaultKycProviderExecutionPolicyService.update({ tenant: request.tenant, authData: request.authData, query: { providerPolicyCode: policy.providerPolicyCode, version: policy.version }, model: { $set: { circuitOpenUntil: openUntil, version: Number(policy.version) + 1 } } }); return !!result; }
};
