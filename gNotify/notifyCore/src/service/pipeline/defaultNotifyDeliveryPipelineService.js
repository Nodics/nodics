/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module notifyCore/service/pipeline/DefaultNotifyDeliveryPipelineService @description Executes one governed delivery while keeping plaintext content transient. @layer service @owner notifyCore */
module.exports = {
  /**
   * Initializes the module artifact within the notifyCore-owned layered contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); },
  /**
   * Executes the input operation within the notifyCore-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  input: function (request) { return request.notifyDelivery || request.body || request.model || {}; }, state: function (request) { request.notifyState = request.notifyState || {}; return request.notifyState; },
  /**
   * Validates request within the notifyCore-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  validateRequest: async function (request) { let state = this.state(request), input = this.input(request); state.input = input; state.policy = await SERVICE.DefaultNotifyPolicyService.resolve(request, input); state.rateLimit = await SERVICE.DefaultNotifyRateLimitService.assertAllowed(request, input, state.policy.scope, state.policy.effectivePolicy); if (state.rateLimit.idempotent === true) { state.delivery = state.rateLimit.request; return { idempotent: request }; } return { success: request }; },
  /**
   * Resolves scenario within the notifyCore-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  resolveScenario: function (request) { return Promise.resolve({ success: request }); }, resolveChannel: function (request) { return Promise.resolve({ success: request }); },
  /**
   * Resolves recipient and consent within the notifyCore-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  resolveRecipientAndConsent: async function (request) { let state = this.state(request); state.consent = await SERVICE.DefaultNotifyPolicyService.consent(request, state.input, state.policy); return state.consent.allowed ? { success: request } : { suppressed: request }; },
  /**
   * Resolves template within the notifyCore-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  resolveTemplate: async function (request) { let state = this.state(request); state.template = await SERVICE.DefaultNotifyTemplateResolutionService.resolve(request, state.input, state.policy); return { success: request }; },
  /**
   * Resolves context within the notifyCore-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  resolveContext: async function (request) { let state = this.state(request); state.context = await SERVICE.DefaultNotifyContextResolutionService.resolve(request, state.input, state.policy, state.template); return { success: request }; },
  /**
   * Executes the render content operation within the notifyCore-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  renderContent: function (request) { let state = this.state(request); state.rendered = SERVICE.DefaultNotifyRenderingService.render(state.input.channelCode, state.template.version, state.context); return Promise.resolve({ success: request }); },
  /**
   * Executes the select provider operation within the notifyCore-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  selectProvider: async function (request) { let state = this.state(request); state.selected = await SERVICE.DefaultNotifyProviderRegistryService.select(request, state.input, state.policy); return { success: request }; },
  /**
   * Executes the persist request operation within the notifyCore-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  persistRequest: async function (request) { let state = this.state(request); state.delivery = await SERVICE.DefaultNotifyDeliveryPersistenceService.persistRequest(request, state.input, state.policy, state.template, state.context, state.rendered, state.selected); return { success: request }; },
  /**
   * Sends message within the notifyCore-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  sendMessage: async function (request) { let state = this.state(request), message = { requestCode: state.delivery.requestCode, channelCode: state.input.channelCode, recipientReference: state.input.recipientReference, providerAccount: state.selected.account, content: state.rendered.output, idempotencyKey: state.delivery.idempotencyKey }; state.startedAt = new Date(); try { state.providerResult = await state.selected.adapter.send(message); return { success: request }; } catch (error) { let retryPolicy = ((CONFIG.get('notify') || {}).resilience.retryPolicies || {})[state.policy.messageType.retryPolicyCode] || {}; if (error.retryable !== false && retryPolicy.fallbackAllowed === true) { try { state.fallbackFromProviderCode = state.selected.provider.providerCode; state.selected = await SERVICE.DefaultNotifyProviderRegistryService.select(request, state.input, state.policy, [state.fallbackFromProviderCode]); message.providerAccount = state.selected.account; message.idempotencyKey += ':fallback'; state.providerResult = await state.selected.adapter.send(message); state.providerResult.safeEvidence = Object.assign({}, state.providerResult.safeEvidence, { fallbackFromProviderCode: state.fallbackFromProviderCode }); return { success: request }; } catch (fallbackError) { error = fallbackError; } } state.providerError = error; return { error: request }; } },
  /**
   * Normalizes result within the notifyCore-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  normalizeResult: function (request) { let state = this.state(request), raw = state.providerResult || {}; state.normalized = { status: raw.status || 'SENT', resultCode: raw.resultCode || 'ACCEPTED', providerMessageReference: raw.providerMessageReference, retryable: false, latencyMs: Date.now() - state.startedAt.getTime(), startedAt: state.startedAt, completedAt: new Date(), safeEvidence: raw.safeEvidence || {} }; return Promise.resolve({ success: request }); },
  /**
   * Normalizes failure within the notifyCore-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  normalizeFailure: function (request) { let state = this.state(request), error = state.providerError || {}; state.normalized = { status: error.retryable === false ? 'FAILED' : 'RETRY_SCHEDULED', failureCode: error.code || 'PROVIDER_ERROR', retryable: error.retryable !== false, latencyMs: Date.now() - state.startedAt.getTime(), startedAt: state.startedAt, completedAt: new Date(), safeEvidence: {} }; return Promise.resolve({ success: request }); },
  /**
   * Executes the persist attempt operation within the notifyCore-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  persistAttempt: async function (request) { let state = this.state(request); state.attempt = await SERVICE.DefaultNotifyDeliveryPersistenceService.persistAttempt(request, state.delivery, state.selected, state.normalized); return { success: request }; },
  /**
   * Executes the persist suppression operation within the notifyCore-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  persistSuppression: async function (request) { let state = this.state(request); state.delivery = await SERVICE.DefaultNotifyDeliveryPersistenceService.persistSuppression(request, state.input, state.policy, state.consent); state.normalized = { status: 'SUPPRESSED', resultCode: state.consent.reasonCode }; return { success: request }; },
  /**
   * Publishes event within the notifyCore-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  publishEvent: async function (request) { let state = this.state(request); state.event = await SERVICE.DefaultNotifyEventService.publish(request, state.delivery, state.normalized); return { success: request }; },
  /**
   * Handles success end within the notifyCore-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  handleSuccessEnd: function (request) { let state = this.state(request); return Promise.resolve({ requestCode: state.delivery.requestCode, status: state.normalized.status, resultCode: state.normalized.resultCode, failureCode: state.normalized.failureCode, idempotent: state.delivery.idempotent === true }); },
  /**
   * Handles idempotent end within the notifyCore-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  handleIdempotentEnd: function (request) { let delivery = this.state(request).delivery; return Promise.resolve({ requestCode: delivery.requestCode, status: delivery.status, idempotent: true }); },
  /**
   * Handles error end within the notifyCore-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  handleErrorEnd: function (request) { return Promise.reject(request.error || new Error('Notification pipeline failed')); },
};
