/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
const assert = require('assert'); const adapter = require('../src/service/defaultTwilioNotifyProviderAdapterService');
const originalConfig = global.CONFIG; const originalService = global.SERVICE;
describe('Twilio notify provider candidate', function () { afterEach(function () { global.CONFIG = originalConfig; global.SERVICE = originalService; }); it('fails closed while disabled', async function () { global.CONFIG = { get: () => ({ enabled: false }) }; await assert.rejects(() => adapter.send({ channelCode: 'sms' }), /disabled/); }); it('normalizes provider-specific responses', async function () { global.CONFIG = { get: () => ({ enabled: true, supportedChannels: ['sms'], secretResolverService: 'Secrets', clientService: 'Client', retryableErrorCodes: [] }) }; global.SERVICE = { Secrets: { resolve: async () => ({ token: 'hidden' }) }, Client: { send: async () => ({ sid: 'SM1', status: 'queued' }) } }; let result = await adapter.send({ channelCode: 'sms', providerAccount: { secretReference: 'secret://twilio' }, recipientReference: 'profile:1', content: { text: 'Hello' }, idempotencyKey: 'i1' }); assert.strictEqual(result.resultCode, 'TWILIO_ACCEPTED'); assert.ok(!JSON.stringify(result).includes('hidden')); }); });
