/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module fulfillment/service/return/DefaultReturnRequestService
 * @description Creates and transitions Fulfillment-owned return request, pickup, and received evidence.
 * @layer service
 * @owner fulfillment
 * @override Customer modules may replace approval, pickup provider, inspection, and disposition behavior without moving return evidence into Order or Payment.
 */
module.exports = {
    /** Initializes return request orchestration. */
    init: function () { return Promise.resolve(true); },
    /** Completes return request orchestration startup. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns layered fulfillment policy. */
    config: function () { return ((CONFIG.get('fulfillment') || {}).fulfillmentPolicy) || {}; },
    /** Creates a stable return request error. */
    error: function (message) {
        if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(message, null, 'ERR_FUL_00007');
        let error = new Error(message);
        error.code = 'ERR_FUL_00007';
        return error;
    },
    /** Normalizes generated-service responses and preloaded arrays. */
    items: function (value) {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        if (Array.isArray(value.result)) return value.result;
        if (Array.isArray(value.items)) return value.items;
        return [value];
    },
    /** Loads one return request by return or idempotency identity. */
    loadReturn: async function (request) {
        if (request.returnRequest) return request.returnRequest;
        if (!SERVICE.DefaultFulfillmentReturnRequestService || typeof SERVICE.DefaultFulfillmentReturnRequestService.get !== 'function') {
            throw this.error('Fulfillment return request generated service is unavailable');
        }
        let query = request.returnCode ? { returnCode: request.returnCode } :
            request.idempotencyKey ? { idempotencyKey: request.idempotencyKey } : undefined;
        if (!query) throw this.error('Return request requires returnCode or idempotencyKey');
        let response = await SERVICE.DefaultFulfillmentReturnRequestService.get({
            tenant: request.tenant,
            authData: request.authData,
            query: query,
            searchOptions: { limit: 2 },
        });
        let returns = this.items(response);
        if (returns.length > 1) throw this.error('Return request resolved duplicate records');
        return returns[0];
    },
    /** Loads existing return evidence when creation can proceed without a prior record. */
    existingReturn: async function (request, idempotencyKey) {
        try {
            return await this.loadReturn(Object.assign({}, request, { idempotencyKey: idempotencyKey }));
        } catch (error) {
            if (String((error || {}).message || '').includes('generated service is unavailable')) throw error;
            throw error;
        }
    },
    /** Persists return evidence through the generated Fulfillment service. */
    saveReturn: async function (request, returnRequest) {
        if (!SERVICE.DefaultFulfillmentReturnRequestService || typeof SERVICE.DefaultFulfillmentReturnRequestService.save !== 'function') {
            throw this.error('Fulfillment return request generated service is unavailable');
        }
        let response = await SERVICE.DefaultFulfillmentReturnRequestService.save({
            tenant: request.tenant,
            authData: request.authData,
            model: returnRequest,
        });
        return this.items(response)[0] || response.result || returnRequest;
    },
    /** Validates common request authority and safety. */
    validateRequest: function (request) {
        if (!request || !request.tenant || !request.authData) throw this.error('Return request requires tenant and auth');
        if (SERVICE.DefaultFulfillmentPolicyService && typeof SERVICE.DefaultFulfillmentPolicyService.assertSafe === 'function') {
            SERVICE.DefaultFulfillmentPolicyService.assertSafe(request);
        }
    },
    /** Creates return request evidence idempotently. */
    requestReturn: async function (request) {
        this.validateRequest(request);
        if (!SERVICE.DefaultFulfillmentPolicyService || typeof SERVICE.DefaultFulfillmentPolicyService.buildReturnRequestDraft !== 'function') {
            throw this.error('Fulfillment policy service is unavailable');
        }
        let draft = SERVICE.DefaultFulfillmentPolicyService.buildReturnRequestDraft(request);
        let existing = await this.existingReturn(request, draft.idempotencyKey);
        if (existing) return Object.assign({ idempotent: true }, existing);
        return this.saveReturn(request, draft);
    },
    /** Applies return lifecycle transition through Fulfillment policy. */
    transitionReturn: async function (request, targetStatus, patch) {
        this.validateRequest(request);
        let returnRequest = await this.loadReturn(request);
        if (!returnRequest) throw this.error('Return request was not found');
        let transitions = this.config().returnTransitions || {};
        let allowed = transitions[returnRequest.status || 'REQUESTED'] || [];
        if (returnRequest.status !== targetStatus && !allowed.includes(targetStatus)) {
            throw this.error('Return transition from ' + returnRequest.status + ' to ' + targetStatus + ' is unsupported');
        }
        let model = Object.assign({}, returnRequest, patch || {}, { status: targetStatus });
        if (!SERVICE.DefaultFulfillmentPolicyService || typeof SERVICE.DefaultFulfillmentPolicyService.prepareReturnRequest !== 'function') {
            throw this.error('Fulfillment policy service is unavailable');
        }
        return this.saveReturn(request, SERVICE.DefaultFulfillmentPolicyService.prepareReturnRequest({ model: model }));
    },
    /** Approves a requested return. */
    approveReturn: async function (request) {
        return this.transitionReturn(request, 'APPROVED', {
            dispositionCode: request.dispositionCode,
            refundPolicyCode: request.refundPolicyCode,
        });
    },
    /** Records return pickup request evidence. */
    requestPickup: async function (request) {
        return this.transitionReturn(request, 'PICKUP_REQUESTED', {
            returnShipmentCode: request.returnShipmentCode,
        });
    },
    /** Records received return evidence. */
    receiveReturn: async function (request) {
        return this.transitionReturn(request, 'RECEIVED', {
            receivedQuantity: request.receivedQuantity,
            receivedAt: request.receivedAt || new Date(),
        });
    },
    /** Closes inspected return evidence. */
    closeReturn: async function (request) {
        let existing = await this.loadReturn(request);
        let dispositionCode = request.dispositionCode || existing.dispositionCode || (this.config().returnDisposition || {}).defaultDispositionCode;
        let inventoryDispositionIntent;
        if (SERVICE.DefaultFulfillmentPolicyService && typeof SERVICE.DefaultFulfillmentPolicyService.buildReturnDispositionIntent === 'function') {
            inventoryDispositionIntent = SERVICE.DefaultFulfillmentPolicyService.buildReturnDispositionIntent(
                Object.assign({}, request, { dispositionCode: dispositionCode }),
                existing
            );
        }
        return this.transitionReturn(request, 'CLOSED', {
            dispositionCode: dispositionCode,
            dispositionAt: request.dispositionAt || new Date(),
            inspectionResult: request.inspectionResult,
            inventoryDispositionIntent: inventoryDispositionIntent,
        });
    },
    /** Provides safe Fulfillment-owned recovery guidance for a checkout reverse return. */
    reviewReturnRecovery: async function (request) {
        this.validateRequest(request);
        let returnRequest = await this.loadReturn(request);
        if (!returnRequest) throw this.error('Return request was not found');
        let recovery = this.config().returnRecovery || {};
        let actions = recovery.reviewActions || ['REVIEW_RETURN'];
        let terminalStatuses = recovery.terminalStatuses || ['CLOSED', 'CANCELLED', 'FAILED'];
        let status = returnRequest.status || 'UNKNOWN';
        return {
            recovered: terminalStatuses.includes(status),
            recoveryAction: request.recoveryAction || 'REVIEW_RETURN',
            recoveryOwner: 'fulfillment',
            recoveryStatus: terminalStatuses.includes(status) ? 'RETURN_TERMINAL' : 'RETURN_REVIEW_REQUIRED',
            returnCode: returnRequest.returnCode,
            orderCode: returnRequest.orderCode,
            status: status,
            dispositionCode: returnRequest.dispositionCode,
            receivedQuantity: returnRequest.receivedQuantity,
            inventoryDispositionIntent: returnRequest.inventoryDispositionIntent,
            nextActions: terminalStatuses.includes(status) ? [] : actions,
        };
    },
};
