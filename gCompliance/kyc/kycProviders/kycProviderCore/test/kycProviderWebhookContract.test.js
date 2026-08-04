/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const assert = require('assert'); const crypto = require('crypto');
const service = require('../src/service/defaultKycProviderWebhookService');
const verifier = require('../../mockKycProvider/src/service/defaultMockKycWebhookVerifierService');
describe('KYC provider webhook security contract', function () {
    const originalConfig = global.CONFIG; const originalService = global.SERVICE; let events;
    beforeEach(function () {
        events = [];
        global.CONFIG = { get: key => key === 'kyc' ? { providerWebhook: { signatureHeader: 'x-signature', eventIdHeader: 'x-event-id', timestampHeader: 'x-timestamp', accountHeader: 'x-account', secretResolverService: 'Secrets' } } : key === 'kyc.persistence' ? { transactionModuleName: 'kycSchema' } : {} };
        global.SERVICE = {
            DefaultKycProviderService: { get: async () => ({ result: [{ providerCode: 'mockKyc', secretReference: 'secret://mock', webhookVerifierService: 'Verifier' }] }) },
            DefaultKycProviderExecutionPolicyService: { get: async () => ({ result: [{ webhookToleranceSeconds: 300 }] }) },
            DefaultKycProviderAccountService: { get: async () => ({ result: [{ providerAccountCode: 'account-1', providerCode: 'mockKyc', secretReference: 'secret://mock-webhook', webhookEnabled: true }] }) },
            Secrets: { resolve: async () => [{ signingSecret: 'current-secret' }, { signingSecret: 'previous-secret' }] }, Verifier: verifier,
            DefaultDatabaseTransactionService: { execute: async (scope, work) => work({ transactionId: 'tx' }) },
            DefaultKycProviderWebhookEventService: { get: async input => ({ result: events.filter(event => event.eventIdentityHash === input.query.eventIdentityHash) }), save: async input => { events.push(input.model); return input.model; }, update: async () => ({ modifiedCount: 1 }) }
        };
    });
    afterEach(function () { global.CONFIG = originalConfig; global.SERVICE = originalService; });
    const signed = secret => { const rawBody = Buffer.from('{"caseCode":"case-1"}'); const timestamp = new Date().toISOString(); const eventId = 'event-1'; const signature = crypto.createHmac('sha256', secret).update(`${timestamp}.${eventId}.${rawBody.toString('utf8')}`).digest('hex'); return { tenant: 't1', tenantCode: 't1', enterpriseCode: 'e1', authData: { tokenType: 'service' }, providerCode: 'mockKyc', providerAccountCode: 'account-1', rawBody, headers: { 'x-signature': `v1=${signature}`, 'x-event-id': eventId, 'x-timestamp': timestamp, 'x-account': 'account-1' } }; };
    it('verifies raw body with current or rotated secrets and persists replay identity', async function () { const result = await service.verify(signed('previous-secret')); assert.strictEqual(result.webhookVerification.signatureVerified, true); assert.strictEqual(events.length, 1); assert.ok(events[0].bodyHash); assert.strictEqual(events[0].status, 'VERIFIED'); });
    it('rejects invalid signatures and durable event replay', async function () { await assert.rejects(() => service.verify(signed('wrong')), error => error.code === 'KYC_WEBHOOK_REJECTED'); const request = signed('current-secret'); await service.verify(request); await assert.rejects(() => service.verify(request), error => error.code === 'KYC_WEBHOOK_REPLAYED'); });
});
