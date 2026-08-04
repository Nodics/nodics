/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module notifyCore/service/policy/DefaultNotifyPolicyService @description Enforces trusted scope, scenario/channel/message-type relationships, sender permissions, recipients, consent, test-send, and abuse policy before delivery. @layer service @owner notifyCore */
module.exports = {
  init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); }, config: function () { return CONFIG.get('notify') || {}; },
  error: function (code, message) { let error = new Error(message); error.code = code; return error; },
  scope: function (request, input) { let auth = request.authData || {}, tokenTypes = this.config().policy.allowedRequesterTokenTypes || []; if (!request.tenant || !tokenTypes.includes(auth.tokenType)) throw this.error('ERR_NOTIFY_00001', 'Notification request requires authenticated identity'); let enterpriseCode = auth.enterpriseCode || auth.entCode || request.enterpriseCode; if (!enterpriseCode) throw this.error('ERR_NOTIFY_00001', 'Notification request requires trusted enterprise scope'); if (input.enterpriseCode && input.enterpriseCode !== enterpriseCode) throw this.error('ERR_NOTIFY_00001', 'Notification enterprise scope mismatch'); let siteCodes = [].concat(auth.siteCodes || []).filter(Boolean); if (input.siteCode && siteCodes.length && !siteCodes.includes(input.siteCode)) throw this.error('ERR_NOTIFY_00001', 'Notification site scope mismatch'); return { tenantCode: request.tenant, enterpriseCode, siteCode: input.siteCode || auth.siteCode, principalId: auth.principalId || auth.code || 'service', tokenType: auth.tokenType }; },
  validate: function (request, input) { input = input || {}; let config = this.config(), scope = this.scope(request, input), scenario = config.scenarios[input.scenarioCode], channel = config.channels[input.channelCode], type = config.messageTypes[input.messageTypeCode]; if (!input.idempotencyKey || !input.scenarioCode || !input.channelCode || !input.messageTypeCode || !input.recipientReference || !input.recipientType || !input.ownerModule || !input.correlationId) throw this.error('ERR_NOTIFY_00002', 'Notification request identity is incomplete'); if (!scenario || !channel || !type) throw this.error('ERR_NOTIFY_00002', 'Notification scenario, channel, or message type is unavailable'); if (!scenario.allowedChannels.includes(input.channelCode) || !scenario.allowedMessageTypes.includes(input.messageTypeCode)) throw this.error('ERR_NOTIFY_00002', 'Notification relationship is prohibited'); if (scenario.ownerModule !== input.ownerModule && request.authData.tokenType !== 'access') throw this.error('ERR_NOTIFY_00001', 'Notification scenario owner mismatch'); if (input.recipients && input.recipients.length > Number(config.policy.maximumRecipients || 100)) throw this.error('ERR_NOTIFY_00002', 'Notification recipient bound exceeded'); return { scope, scenario, channel, messageType: type }; },
  consent: async function (request, input, policy) { let result = await SERVICE.DefaultNotifyConsentEvidenceProviderService.resolve(request, input, policy); if (!result || result.allowed !== true) return { allowed: false, reasonCode: result && result.reasonCode || 'CONSENT_EVIDENCE_UNAVAILABLE', consentEvidenceCode: result && result.evidenceCode }; return result; },
};
