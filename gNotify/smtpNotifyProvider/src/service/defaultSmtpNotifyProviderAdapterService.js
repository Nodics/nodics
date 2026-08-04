/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module smtpNotifyProvider/service/DefaultSmtpNotifyProviderAdapterService @description Guarded SMTP adapter that resolves credentials by reference and normalizes evidence. @layer provider @owner smtpNotifyProvider */
module.exports = { init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); }, send: async function (message) { let config = CONFIG.get('notifySmtpProvider') || {}; if (config.enabled !== true) throw Object.assign(new Error('SMTP notification provider disabled'), { code: 'SMTP_DISABLED', retryable: false }); if (message.channelCode !== 'email') throw Object.assign(new Error('SMTP supports email only'), { code: 'SMTP_CHANNEL_UNSUPPORTED', retryable: false }); let resolver = SERVICE[config.secretResolverService], transport = SERVICE[config.transportService]; if (!resolver || !transport) throw Object.assign(new Error('SMTP provider dependency unavailable'), { code: 'SMTP_DEPENDENCY_UNAVAILABLE', retryable: true }); let credentials = await resolver.resolve(message.providerAccount.secretReference), started = Date.now(); try { let response = await transport.sendMail({ credentials, senderIdentity: message.providerAccount.senderIdentity, recipientReference: message.recipientReference, subject: message.content.subject, plainTextBody: message.content.plainTextBody, htmlBody: message.content.htmlBody, attachments: message.content.attachments, timeoutMs: config.timeoutMs, idempotencyKey: message.idempotencyKey }); return { status: 'SENT', resultCode: 'SMTP_ACCEPTED', providerMessageReference: response.messageId, safeEvidence: { acceptedCount: Number(response.acceptedCount || 1), latencyMs: Date.now() - started } }; } catch (error) { error.retryable = (config.retryableErrorCodes || []).includes(error.code); throw error; } } };
