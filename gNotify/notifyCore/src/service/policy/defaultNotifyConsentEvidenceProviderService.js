/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module notifyCore/service/policy/DefaultNotifyConsentEvidenceProviderService @description Consumes Profile or Customer-owned communication preference evidence without becoming a consent authority. @layer service @owner notifyCore */
module.exports = { init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); }, config: function () { return CONFIG.get('notify') || {}; }, resolve: async function (request, input, policy) { let type = policy.messageType, consentRequired = type.consentRequired === true; if (SERVICE.DefaultProfileCommunicationPreferenceService && typeof SERVICE.DefaultProfileCommunicationPreferenceService.resolve === 'function') { let result = await SERVICE.DefaultProfileCommunicationPreferenceService.resolve({ tenant: request.tenant, authData: request.authData, enterpriseCode: policy.scope.enterpriseCode, recipientType: input.recipientType, recipientReference: input.recipientReference, channelCode: input.channelCode, scenarioCode: input.scenarioCode, messageTypeCode: input.messageTypeCode }); if (!result || result.allowed !== true) return { allowed: false, reasonCode: result && result.reasonCode || 'PROFILE_PREFERENCE_DENIED', evidenceCode: result && result.evidenceCode }; return { allowed: true, evidenceCode: result.evidenceCode, owner: 'profile' }; } if (consentRequired || this.config().consent.failClosed && !(this.config().consent.essentialMessageTypes || []).includes(input.messageTypeCode)) return { allowed: false, reasonCode: 'CONSENT_AUTHORITY_UNAVAILABLE' }; return { allowed: true, evidenceCode: 'ESSENTIAL:' + input.messageTypeCode, owner: 'policy' }; } };
