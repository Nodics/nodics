/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module order/service/lifecycle/DefaultOrderLifecycleIntentService @description Secured reusable customer/support intent boundary for Return and Refund requests over private Order persistence. @layer service @owner order */
module.exports = {
    /**
     * Initializes the module artifact within the order-owned layered contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); },
    /**
     * Executes the error operation within the order-owned layered contract.
     *
     * @param {*} message Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    error: function (message) { let error = new Error(message); error.code = 'ERR_ORD_00066'; return error; },
    /**
     * Executes the helper operation within the order-owned layered contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    helper: function () { if (!SERVICE.DefaultOrderCancellationIntentService) throw this.error('Order lifecycle identity helper is unavailable'); return SERVICE.DefaultOrderCancellationIntentService; },
    /**
     * Executes the type operation within the order-owned layered contract.
     *
     * @param {*} value Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    type: function (value) { value = String(value || '').toUpperCase(); if (!['CANCELLATION', 'RETURN', 'REFUND'].includes(value)) throw this.error('Lifecycle intent type is unsupported'); return value; },
    /**
     * Asserts scope within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} order Value defined by the surrounding Nodics operation contract.
     * @param {*} support Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    assertScope: function (request, order, support) { if (!support) return; let auth = request.authData || {}; let siteCodes = [].concat(auth.siteCodes || []).filter(Boolean), channelCodes = [].concat(auth.channelCodes || []).filter(Boolean); if (siteCodes.length && !siteCodes.includes(order.siteCode)) throw this.error('Support lifecycle Order site is outside assigned scope'); if (channelCodes.length && !channelCodes.includes(order.channelCode)) throw this.error('Support lifecycle Order channel is outside assigned scope'); },
    /**
     * Creates the module artifact within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} requestType Value defined by the surrounding Nodics operation contract.
     * @param {*} support Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    create: async function (request, requestType, support) { let type = this.type(requestType), input = Object.assign({}, request.body || {}), helper = this.helper(); if (!request.tenant || !request.authData || !input.entCode || !input.orderCode) throw this.error(type + ' intent requires tenant, auth, enterprise, and Order'); helper.enterprise(request, input.entCode); let order = await helper.loadOrder(request, input); this.assertScope(request, order, support === true); let customerCode = helper.customerCode(request, order, support === true); if (support !== true) await helper.rateLimit(request, input); let items = await helper.snapshotItems(request, input); let intent = Object.assign({}, input, { requestType: type, customerCode: customerCode, siteCode: order.siteCode, channelCode: order.channelCode, currencyCode: order.currencyCode, locale: order.locale, countryCode: order.countryCode, requesterType: support ? 'EMPLOYEE' : 'CUSTOMER', items: items }); let created = await SERVICE.DefaultOrderLifecycleOrchestrationService.createDraft(Object.assign({}, request, { orderLifecycle: intent })); let submitted = await SERVICE.DefaultOrderLifecycleOrchestrationService.submit(Object.assign({}, request, { orderLifecycle: { requestCode: created.request.requestCode, entCode: input.entCode } })); await SERVICE.DefaultOrderLifecycleAuditService.record(request, submitted.request, type + '_SUBMITTED', submitted.request.workflowCarrierCode || submitted.request.requestCode, (support ? 'Support' : 'Customer') + ' submitted ' + type.toLowerCase()); return Object.assign({}, submitted, { createdIdempotently: created.idempotent === true }); },
    /**
     * Loads the module artifact within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} requestType Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    load: async function (request, requestType) { let type = this.type(requestType), input = Object.assign({}, request.query || {}, request.params || {}, request.body || {}), helper = this.helper(); let entCode = input.entCode || (request.authData || {}).entCode || (request.authData || {}).enterpriseCode; if (!entCode || !input.requestCode) throw this.error(type + ' request identity is required'); helper.enterprise(request, entCode); let model = await SERVICE.DefaultOrderLifecycleOrchestrationService.loadRequest(request, { entCode: entCode, requestCode: input.requestCode }); if (!model || model.requestType !== type) throw this.error(type + ' request is unavailable'); return model; },
    /**
     * Executes the status operation within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} requestType Value defined by the surrounding Nodics operation contract.
     * @param {*} support Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    status: async function (request, requestType, support) { let model = await this.load(request, requestType), helper = this.helper(), order = await helper.loadOrder(request, { entCode: model.entCode, orderCode: model.orderCode }); this.assertScope(request, order, support === true); let customerCode = helper.customerCode(request, order, support === true); if (model.customerCode && model.customerCode !== customerCode) throw this.error('Lifecycle request customer scope mismatch'); let items = await SERVICE.DefaultOrderLifecycleOrchestrationService.loadItems(request, model.requestCode); return SERVICE.DefaultOrderLifecycleStatusProjectionService.project({ request: model, items: items }); },
    /**
     * Cancels draft within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} requestType Value defined by the surrounding Nodics operation contract.
     * @param {*} support Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    cancelDraft: async function (request, requestType, support) { let aggregate = await this.status(request, requestType, support); if (aggregate.request.state === 'CANCELLED') return Object.assign({ idempotent: true }, aggregate); if (!['DRAFT', 'SUBMISSION_FAILED'].includes(aggregate.request.state)) throw this.error('Only a non-submitted lifecycle draft can be cancelled'); let helper = this.helper(); let updated = await SERVICE.DefaultOrderLifecycleOrchestrationService.updateState(request, aggregate.request, [aggregate.request.state], { state: 'CANCELLED', evidence: Object.assign({}, aggregate.request.evidence || {}, { cancelledBy: helper.principal(request), cancelledAt: new Date() }) }); await SERVICE.DefaultOrderLifecycleAuditService.record(request, updated, requestType + '_DRAFT_CANCELLED', updated.version, requestType + ' draft cancelled'); return { request: updated, items: aggregate.items }; },
    /**
     * Executes the provide information operation within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} requestType Value defined by the surrounding Nodics operation contract.
     * @param {*} support Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    provideInformation: async function (request, requestType, support) { let aggregate = await this.status(request, requestType, support), input = request.body || {}, config = (((CONFIG.get('order') || {}).orderLifecycle || {}).intents) || {}; if (aggregate.request.state !== 'INFORMATION_REQUESTED' || Number(input.expectedVersion) !== Number(aggregate.request.version)) throw this.error('Lifecycle information response is stale or not requested'); if (typeof input.message !== 'string' || !input.message.trim() || input.message.length > Number(config.maximumInformationLength || 2000)) throw this.error('Lifecycle information message is required and bounded'); let mediaCodes = [].concat(input.mediaCodes || []).filter(Boolean); if (mediaCodes.length > Number(config.maximumEvidenceMedia || 10) || new Set(mediaCodes).size !== mediaCodes.length || mediaCodes.some(code => typeof code !== 'string' || code.length > 200)) throw this.error('Lifecycle evidence media references are invalid or exceed bounds'); let evidence = Object.assign({}, aggregate.request.evidence || {}, { informationResponse: { message: input.message.trim(), mediaCodes: mediaCodes, pickupOption: input.pickupOption, preferredRefundMode: input.preferredRefundMode, providedBy: this.helper().principal(request), providedAt: new Date() } }); let provided = await SERVICE.DefaultOrderLifecycleOrchestrationService.updateState(request, aggregate.request, ['INFORMATION_REQUESTED'], { state: 'INFORMATION_PROVIDED', evidence: evidence }); await SERVICE.DefaultOrderLifecycleAuditService.record(request, provided, requestType + '_INFORMATION_PROVIDED', provided.version, requestType + ' requested information provided'); return SERVICE.DefaultOrderLifecycleOrchestrationService.submit(Object.assign({}, request, { orderLifecycle: { requestCode: provided.requestCode, entCode: provided.entCode } })); },
};
