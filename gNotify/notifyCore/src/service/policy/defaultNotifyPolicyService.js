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
  /**
   * Initializes the module artifact within the notifyCore-owned layered contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); }, config: function () { return CONFIG.get('notify') || {}; },
  /**
   * Executes the error operation within the notifyCore-owned layered contract.
   *
   * @param {*} code Value defined by the surrounding Nodics operation contract.
   * @param {*} message Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  error: function (code, message) { let error = new Error(message); error.code = code; return error; },
  /**
   * Executes the scope operation within the notifyCore-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @param {*} input Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  scope: function (request, input) { let auth = request.authData || {}, tokenTypes = this.config().policy.allowedRequesterTokenTypes || []; if (!request.tenant || !tokenTypes.includes(auth.tokenType)) throw this.error('ERR_NOTIFY_00001', 'Notification request requires authenticated identity'); let enterpriseCode = auth.enterpriseCode || auth.entCode || request.enterpriseCode; if (!enterpriseCode) throw this.error('ERR_NOTIFY_00001', 'Notification request requires trusted enterprise scope'); if (input.enterpriseCode && input.enterpriseCode !== enterpriseCode) throw this.error('ERR_NOTIFY_00001', 'Notification enterprise scope mismatch'); let siteCodes = [].concat(auth.siteCodes || []).filter(Boolean); if (input.siteCode && siteCodes.length && !siteCodes.includes(input.siteCode)) throw this.error('ERR_NOTIFY_00001', 'Notification site scope mismatch'); return { tenantCode: request.tenant, enterpriseCode, siteCode: input.siteCode || auth.siteCode, principalId: auth.principalId || auth.code || 'service', tokenType: auth.tokenType }; },
  /**
   * Validates the module artifact within the notifyCore-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @param {*} input Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  validate: function (request, input) { input = input || {}; let config = this.config(), scope = this.scope(request, input), scenario = config.scenarios[input.scenarioCode], channel = config.channels[input.channelCode], type = config.messageTypes[input.messageTypeCode]; if (!input.idempotencyKey || !input.scenarioCode || !input.channelCode || !input.messageTypeCode || !input.recipientReference || !input.recipientType || !input.ownerModule || !input.correlationId) throw this.error('ERR_NOTIFY_00002', 'Notification request identity is incomplete'); if (!scenario || !channel || !type) throw this.error('ERR_NOTIFY_00002', 'Notification scenario, channel, or message type is unavailable'); if (!scenario.allowedChannels.includes(input.channelCode) || !scenario.allowedMessageTypes.includes(input.messageTypeCode)) throw this.error('ERR_NOTIFY_00002', 'Notification relationship is prohibited'); if (scenario.ownerModule !== input.ownerModule && request.authData.tokenType !== 'access') throw this.error('ERR_NOTIFY_00001', 'Notification scenario owner mismatch'); if (input.recipients && input.recipients.length > Number(config.policy.maximumRecipients || 100)) throw this.error('ERR_NOTIFY_00002', 'Notification recipient bound exceeded'); return { scope, scenario, channel, messageType: type }; },
  /**
   * Resolves the module artifact within the notifyCore-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @param {*} input Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  resolve: async function (request, input) { let effective = this.validate(request, input), now = new Date(), service = SERVICE.DefaultNotifyDeliveryPolicyService; if (!service || typeof service.get !== 'function') return effective; let response = await service.get({ tenant: request.tenant, authData: request.authData, query: { tenantCode: effective.scope.tenantCode, enterpriseCode: effective.scope.enterpriseCode, status: 'ACTIVE' }, searchOptions: { limit: 100, sort: { priority: 1 } } }), policies = response && response.result || []; let matches = policies.filter(policy => (!policy.siteCode || policy.siteCode === effective.scope.siteCode) && (!policy.channelCodes || policy.channelCodes.includes(input.channelCode)) && (!policy.scenarioCodes || policy.scenarioCodes.includes(input.scenarioCode)) && (!policy.messageTypeCodes || policy.messageTypeCodes.includes(input.messageTypeCode)) && (!policy.effectiveFrom || new Date(policy.effectiveFrom) <= now) && (!policy.effectiveUntil || new Date(policy.effectiveUntil) > now)); effective.deliveryPolicies = matches; effective.effectivePolicy = matches.reduce((result, policy) => Object.assign(result, policy), {}); let quiet = effective.effectivePolicy.quietHours; if (quiet && quiet.enabled === true && ![].concat(effective.effectivePolicy.quietHoursBypassMessageTypes || []).includes(input.messageTypeCode)) { let hour = Number(new Intl.DateTimeFormat('en', { hour: '2-digit', hour12: false, timeZone: quiet.timeZone || 'UTC' }).format(now)); let start = Number(quiet.startHour), end = Number(quiet.endHour), blocked = start < end ? hour >= start && hour < end : hour >= start || hour < end; if (blocked) throw this.error('ERR_NOTIFY_00013', 'Notification delivery is blocked by quiet hours'); } if (effective.effectivePolicy.consentRequired !== undefined) effective.messageType = Object.assign({}, effective.messageType, { consentRequired: effective.effectivePolicy.consentRequired }); if (effective.effectivePolicy.retryPolicyCode) effective.messageType = Object.assign({}, effective.messageType, { retryPolicyCode: effective.effectivePolicy.retryPolicyCode }); return effective; },
  /**
   * Executes the consent operation within the notifyCore-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @param {*} input Value defined by the surrounding Nodics operation contract.
   * @param {*} policy Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  consent: async function (request, input, policy) { let result = await SERVICE.DefaultNotifyConsentEvidenceProviderService.resolve(request, input, policy); if (!result || result.allowed !== true) return { allowed: false, reasonCode: result && result.reasonCode || 'CONSENT_EVIDENCE_UNAVAILABLE', consentEvidenceCode: result && result.evidenceCode }; return result; },
};
