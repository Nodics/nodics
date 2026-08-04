/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
const assert = require('assert'); const adapter = require('../src/service/defaultSmtpNotifyProviderAdapterService');
const originalConfig = global.CONFIG; const originalService = global.SERVICE;
describe('SMTP notify provider candidate', function () { afterEach(function () { global.CONFIG = originalConfig; global.SERVICE = originalService; }); it('fails closed while disabled', async function () { global.CONFIG = { get: () => ({ enabled: false }) }; await assert.rejects(() => adapter.send({ channelCode: 'email' }), /disabled/); }); it('resolves secrets and normalizes response without leaking credentials', async function () { global.CONFIG = { get: () => ({ enabled: true, supportedChannels: ['email'], secretResolverService: 'Secrets', transportService: 'Transport', retryableErrorCodes: [] }) }; global.SERVICE = { Secrets: { resolve: async () => ({ password: 'hidden' }) }, Transport: { sendMail: async () => ({ messageId: 'm1', acceptedCount: 1 }) } }; let result = await adapter.send({ channelCode: 'email', providerAccount: { secretReference: 'secret://smtp' }, recipientReference: 'profile:1', content: { subject: 'Hi', plainTextBody: 'Body' }, idempotencyKey: 'i1' }); assert.strictEqual(result.providerMessageReference, 'm1'); assert.ok(!JSON.stringify(result).includes('hidden')); }); });
