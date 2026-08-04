/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module kycProviderCore/service/DefaultKycProviderWebhookService @description Selects provider verification, resolves rotated secrets, and persists atomic replay evidence before normalization. @layer service @owner kycProviderCore @override Provider modules replace verifier services; projects replace secret and account mapping through layered configuration. */
const crypto = require('crypto');
const list = value => value && Array.isArray(value.result) ? value.result : Array.isArray(value) ? value : [];
const fail = (message, code) => Object.assign(new Error(message), { code });
module.exports = {
    init: () => Promise.resolve(true), postInit: () => Promise.resolve(true),
    /**
     * Executes the config operation within the kycProviderCore-owned layered contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    config: function () { return (CONFIG.get('kyc') || {}).providerWebhook || {}; },
    /**
     * Loads one within the kycProviderCore-owned layered contract.
     *
     * @param {*} service Value defined by the surrounding Nodics operation contract.
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} query Value defined by the surrounding Nodics operation contract.
     * @param {*} label Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    loadOne: async function (service, request, query, label) { const values = list(await service.get({ tenant: request.tenant, authData: request.authData, query, searchOptions: { limit: 2 } }, {})); if (values.length !== 1) throw fail(`Scoped ${label} is missing or ambiguous.`, 'KYC_WEBHOOK_REJECTED'); return values[0]; },
    /**
     * Executes the verify operation within the kycProviderCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    verify: async function (request) {
        const rawBody = request.rawBody; const headers = request.headers || request.httpRequest && request.httpRequest.headers || {}; const config = this.config();
        if (!(Buffer.isBuffer(rawBody) || typeof rawBody === 'string')) throw fail('Raw provider callback body is required.', 'KYC_WEBHOOK_REJECTED');
        const provider = await this.loadOne(SERVICE.DefaultKycProviderService, request, { providerCode: request.providerCode, tenantCode: request.tenantCode, enterpriseCode: request.enterpriseCode, status: 'ACTIVE' }, 'KYC provider');
        const policy = await this.loadOne(SERVICE.DefaultKycProviderExecutionPolicyService, request, { providerCode: request.providerCode, tenantCode: request.tenantCode, enterpriseCode: request.enterpriseCode, status: 'ACTIVE' }, 'provider execution policy');
        const accountCode = headers[config.accountHeader || 'x-kyc-account']; const eventId = headers[config.eventIdHeader || 'x-kyc-event-id']; const timestamp = headers[config.timestampHeader || 'x-kyc-timestamp'];
        if (!accountCode || !eventId || !timestamp) throw fail('Provider callback account or event identity is invalid.', 'KYC_WEBHOOK_REJECTED');
        const account = await this.loadOne(SERVICE.DefaultKycProviderAccountService, request, { providerAccountCode: accountCode, providerCode: request.providerCode, tenantCode: request.tenantCode, enterpriseCode: request.enterpriseCode, webhookEnabled: true, status: 'ACTIVE' }, 'provider account');
        const eventTime = new Date(timestamp).getTime(); if (!Number.isFinite(eventTime) || Math.abs(Date.now() - eventTime) > Number(policy.webhookToleranceSeconds || 300) * 1000) throw fail('Provider callback timestamp is outside tolerance.', 'KYC_WEBHOOK_REJECTED');
        const resolver = SERVICE[config.secretResolverService || 'DefaultSecretReferenceService']; const verifier = SERVICE[provider.webhookVerifierService];
        if (!resolver || typeof resolver.resolve !== 'function' || !verifier || typeof verifier.verify !== 'function') throw fail('Provider callback verification dependencies are unavailable.', 'KYC_WEBHOOK_REJECTED');
        const secrets = await resolver.resolve(account.secretReference, { includePrevious: true, purpose: 'kyc-webhook' });
        const proof = await verifier.verify({ rawBody: Buffer.from(rawBody), headers, eventId, timestamp, accountCode, secrets, signatureHeader: config.signatureHeader || 'x-kyc-signature' });
        if (!proof || proof.verified !== true) throw fail('Provider callback signature is invalid.', 'KYC_WEBHOOK_REJECTED');
        const eventIdentityHash = crypto.createHash('sha256').update([request.providerCode, request.tenantCode, accountCode, eventId].join('|')).digest('hex'); const bodyHash = crypto.createHash('sha256').update(Buffer.from(rawBody)).digest('hex');
        const persistence = (CONFIG.get('kyc.persistence') || {}); let eventModel;
        await SERVICE.DefaultDatabaseTransactionService.execute({ moduleName: persistence.transactionModuleName || 'kycSchema', tenant: request.tenant, test: request.test === true }, async transactionContext => {
            const existing = list(await SERVICE.DefaultKycProviderWebhookEventService.get({ tenant: request.tenant, authData: request.authData, transactionContext, query: { eventIdentityHash }, searchOptions: { limit: 2 } }, {}));
            if (existing.length) throw fail('Provider callback replay was rejected.', 'KYC_WEBHOOK_REPLAYED');
            eventModel = { webhookEventCode: `kyc-webhook-${crypto.randomUUID()}`, eventIdentityHash, tenantCode: request.tenantCode, enterpriseCode: request.enterpriseCode, providerCode: request.providerCode, providerAccountCode: accountCode, providerEventId: eventId, bodyHash, signatureVersion: proof.signatureVersion || 'v1', receivedAt: new Date(), attemptCount: 1, status: 'VERIFIED', version: 1 };
            await SERVICE.DefaultKycProviderWebhookEventService.save({ tenant: request.tenant, authData: request.authData, transactionContext, model: eventModel });
        });
        return { eventModel, webhookVerification: { signatureVerified: true, replayed: false, idempotencyAccepted: true }, webhookEnvelope: { eventId, eventTime: new Date(eventTime), providerCode: request.providerCode, tenantCode: request.tenantCode, enterpriseCode: request.enterpriseCode } };
    },
    /**
     * Executes the complete operation within the kycProviderCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} verification Value defined by the surrounding Nodics operation contract.
     * @param {*} outcome Value defined by the surrounding Nodics operation contract.
     * @param {*} errorValue Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    complete: async function (request, verification, outcome, errorValue) {
        const event = verification && verification.eventModel; if (!event) return;
        await SERVICE.DefaultKycProviderWebhookEventService.update({ tenant: request.tenant, authData: request.authData, query: { webhookEventCode: event.webhookEventCode, version: event.version, status: 'VERIFIED' }, model: { $set: { status: errorValue ? 'FAILED' : 'PROCESSED', processedAt: new Date(), safeErrorCode: errorValue && (errorValue.code || 'KYC_WEBHOOK_PROCESSING_FAILED'), version: Number(event.version) + 1 } } });
    }
};
