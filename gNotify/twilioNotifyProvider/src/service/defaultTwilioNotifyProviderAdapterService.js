/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module twilioNotifyProvider/service/DefaultTwilioNotifyProviderAdapterService @description Guarded SMS/WhatsApp adapter using replaceable secret and client services with normalized evidence. @layer provider @owner twilioNotifyProvider */
module.exports = { init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); }, send: async function (message) { let config = CONFIG.get('notifyTwilioProvider') || {}; if (config.enabled !== true) throw Object.assign(new Error('Twilio notification provider disabled'), { code: 'TWILIO_DISABLED', retryable: false }); if (!(config.supportedChannels || []).includes(message.channelCode)) throw Object.assign(new Error('Twilio channel unsupported'), { code: 'TWILIO_CHANNEL_UNSUPPORTED', retryable: false }); let resolver = SERVICE[config.secretResolverService], client = SERVICE[config.clientService]; if (!resolver || !client) throw Object.assign(new Error('Twilio provider dependency unavailable'), { code: 'TWILIO_DEPENDENCY_UNAVAILABLE', retryable: true }); let credentials = await resolver.resolve(message.providerAccount.secretReference), started = Date.now(); try { let response = await client.send({ credentials, channelCode: message.channelCode, senderIdentity: message.providerAccount.senderIdentity, recipientReference: message.recipientReference, text: message.content.text || message.content.body, approvedTemplateId: message.content.approvedTemplateId, mediaHeader: message.content.mediaHeader, idempotencyKey: message.idempotencyKey, timeoutMs: config.timeoutMs }); return { status: 'SENT', resultCode: 'TWILIO_ACCEPTED', providerMessageReference: response.sid, safeEvidence: { providerStatus: response.status, latencyMs: Date.now() - started } }; } catch (error) { error.retryable = (config.retryableErrorCodes || []).includes(String(error.code)); throw error; } } };
