/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const crypto = require('crypto');
/** @module mockKycProvider/service/DefaultMockKycWebhookVerifierService @description Deterministic HMAC verifier proving the provider-specific callback contract. @layer provider @owner mockKycProvider */
module.exports = { init: () => Promise.resolve(true), postInit: () => Promise.resolve(true), verify: async function (input) { const signature = input.headers[input.signatureHeader]; const values = Array.isArray(input.secrets) ? input.secrets : [input.secrets]; const payload = `${input.timestamp}.${input.eventId}.${input.rawBody.toString('utf8')}`; const verified = values.filter(Boolean).some(secret => { const key = secret.signingSecret || secret.secret || secret; const expected = crypto.createHmac('sha256', key).update(payload).digest('hex'); const received = String(signature || '').replace(/^v1=/, ''); return received.length === expected.length && crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected)); }); return { verified, signatureVersion: 'v1' }; } };
