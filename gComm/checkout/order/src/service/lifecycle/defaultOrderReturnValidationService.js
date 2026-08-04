/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module order/service/lifecycle/DefaultOrderReturnValidationService @description Runs side-effect-free exact returnability validation from Fulfillment and Product owner evidence. @layer service @owner order */
module.exports = {
    /**
     * Initializes the module artifact within the order-owned layered contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); },
    /**
     * Executes the config operation within the order-owned layered contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    config: function () { return (((CONFIG.get('order') || {}).orderLifecycle || {}).returnValidation) || {}; },
    /**
     * Executes the error operation within the order-owned layered contract.
     *
     * @param {*} message Value defined by the surrounding Nodics operation contract.
     * @param {*} code Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    error: function (message, code) { if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(message, null, code || 'ERR_ORD_00058'); let error = new Error(message); error.code = code || 'ERR_ORD_00058'; return error; },
    /**
     * Executes the exact operation within the order-owned layered contract.
     *
     * @param {*} value Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    exact: function (value) { if (typeof value !== 'string' || !/^(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(value)) throw this.error('Return quantity must be an exact decimal string'); let parts = value.split('.'); return { units: BigInt(parts.join('')), scale: (parts[1] || '').length }; },
    /**
     * Executes the subtract operation within the order-owned layered contract.
     *
     * @param {*} left Value defined by the surrounding Nodics operation contract.
     * @param {*} right Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    subtract: function (left, right) { let a = this.exact(left); let b = this.exact(right); let scale = Math.max(a.scale, b.scale); let units = a.units * 10n ** BigInt(scale - a.scale) - b.units * 10n ** BigInt(scale - b.scale); if (units < 0n) return '0'; let digits = units.toString().padStart(scale + 1, '0'); return scale ? (digits.slice(0, -scale) || '0') + '.' + digits.slice(-scale) : digits; },
    /**
     * Executes the lte operation within the order-owned layered contract.
     *
     * @param {*} left Value defined by the surrounding Nodics operation contract.
     * @param {*} right Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    lte: function (left, right) { let a = this.exact(left); let b = this.exact(right); let scale = Math.max(a.scale, b.scale); return a.units * 10n ** BigInt(scale - a.scale) <= b.units * 10n ** BigInt(scale - b.scale); },
    /**
     * Executes the positive operation within the order-owned layered contract.
     *
     * @param {*} value Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    positive: function (value) { return this.exact(value).units > 0n; },
    /**
     * Executes the input operation within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    input: function (request) { return request.returnValidation || request.body || {}; },
    /**
     * Validates the module artifact within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    validate: function (request) { let input = this.input(request); if (!request || !request.tenant || !request.authData || !input.entCode || !input.orderCode || !Array.isArray(input.items) || !input.items.length || input.items.length > Number(this.config().maximumItems || 100)) throw this.error('Return validation requires bounded Order item evidence'); input.items.forEach(item => { if (!item.orderEntryCode || !item.unitCode || !this.positive(item.requestedQuantity)) throw this.error('Return selection identity or quantity is invalid'); }); return input; },
    /**
     * Executes the provider operation within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} input Value defined by the surrounding Nodics operation contract.
     * @param {*} owner Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    provider: async function (request, input, owner) { if (input.ownerEvidence && input.ownerEvidence[owner]) return input.ownerEvidence[owner]; let descriptor = (this.config().evidenceProviders || {})[owner] || {}; let service = SERVICE[descriptor.service]; if (!service || typeof service.resolve !== 'function') throw this.error('Return ' + owner + ' evidence provider is unavailable'); return service.resolve({ tenant: request.tenant, authData: request.authData, entCode: input.entCode, orderCode: input.orderCode, items: input.items }); },
    /**
     * Resolves the module artifact within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} input Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    resolve: async function (request, input) { return { fulfillment: await this.provider(request, input, 'fulfillment'), product: await this.provider(request, input, 'product') }; },
    /**
     * Evaluates the module artifact within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} input Value defined by the surrounding Nodics operation contract.
     * @param {*} evidence Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    evaluate: function (request, input, evidence) { let fulfillment = new Map([].concat(evidence.fulfillment.items || []).map(value => [value.orderEntryCode, value])); let product = new Map([].concat(evidence.product.items || []).map(value => [value.orderEntryCode, value])); let now = request.now ? new Date(request.now) : new Date(); let items = input.items.map(selection => { let owner = fulfillment.get(selection.orderEntryCode); let policy = product.get(selection.orderEntryCode); if (!owner || !policy || owner.unitCode !== selection.unitCode) throw this.error('Return owner evidence is incomplete or Unit mismatched'); let available = this.subtract(owner.deliveredQuantity, owner.alreadyReturnedQuantity); let reasons = []; if (policy.returnAllowed !== true) reasons.push(policy.reasonCode || 'PRODUCT_NOT_RETURNABLE'); if (!this.lte(selection.requestedQuantity, available)) reasons.push('REQUESTED_QUANTITY_EXCEEDS_RETURNABLE'); if (!owner.deliveredAt) reasons.push('DELIVERY_EVIDENCE_MISSING'); else { let deliveredAt = new Date(owner.deliveredAt); if (!Number.isFinite(deliveredAt.getTime()) || now.getTime() - deliveredAt.getTime() > Number(policy.returnWindowDays || 0) * 86400000) reasons.push('RETURN_WINDOW_EXPIRED'); } return { orderEntryCode: selection.orderEntryCode, unitCode: selection.unitCode, requestedQuantity: selection.requestedQuantity, returnableQuantity: available, eligible: reasons.length === 0, reasons: reasons, evidence: { fulfillmentCodes: owner.fulfillmentCodes || [], productPolicyCode: policy.policyCode, deliveredAt: owner.deliveredAt, returnWindowDays: policy.returnWindowDays } }; }); return { entCode: input.entCode, orderCode: input.orderCode, eligible: items.every(value => value.eligible), items: items, evaluatedAt: now }; },
    /**
     * Validates request within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    validateRequest: function (request, response, process) { try { response.returnInput = this.validate(request); process.nextSuccess(request, response); } catch (error) { process.error(request, response, error); } },
    /**
     * Resolves owner evidence within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    resolveOwnerEvidence: async function (request, response, process) { try { response.returnEvidence = await this.resolve(request, response.returnInput); process.nextSuccess(request, response); } catch (error) { process.error(request, response, error); } },
    /**
     * Evaluates items within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    evaluateItems: function (request, response, process) { try { response.returnValidation = this.evaluate(request, response.returnInput, response.returnEvidence); process.nextSuccess(request, response); } catch (error) { process.error(request, response, error); } },
    /**
     * Handles success end within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    handleSuccessEnd: function (request, response, process) { process.resolve(response.returnValidation); }, handleErrorEnd: function (request, response, process) { process.reject(response.error || this.error('Return validation Pipeline failed')); },
};
