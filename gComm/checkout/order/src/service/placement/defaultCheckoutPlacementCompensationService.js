/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module order/service/placement/DefaultCheckoutPlacementCompensationService
 * @description Handles checkout placement failure compensation boundaries by delegating promise releases to Inventory and recording safe Order placement failure evidence.
 * @layer service
 * @owner order
 * @override Project modules may replace compensation stages or add payment/fulfillment compensation while preserving owner-module delegation and secret-safe failure evidence.
 */
module.exports = {
    /** Initializes checkout placement compensation. */
    init: function () { return Promise.resolve(true); },
    /** Completes checkout placement compensation startup. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns layered compensation configuration. */
    config: function () { return (((CONFIG.get('order') || {}).checkoutPlacement || {}).compensation) || {}; },
    /** Creates a stable compensation error. */
    error: function (message) {
        if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(message, null, 'ERR_ORD_00028');
        let error = new Error(message);
        error.code = 'ERR_ORD_00028';
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
    /** Builds safe failure evidence without leaking raw provider payloads. */
    failure: function (request) {
        let failure = request.failure || request.error || {};
        let message = String(failure.message || request.failureMessage || 'Checkout placement failed');
        return {
            failureCode: failure.code || request.failureCode || 'CHECKOUT_PLACEMENT_FAILED',
            failureMessage: message.slice(0, Number(this.config().failureMessageLimit || 240)),
        };
    },
    /** Resolves active Inventory Promise reservations from checkout evidence. */
    reservations: function (request) {
        let evidence = request.inventoryReservations || request.feedback && request.feedback.inventoryReservations || {};
        return this.items(evidence.reserved || evidence.reservations || evidence);
    },
    /** Releases Inventory-owned promise reservations; Order never mutates Inventory counters directly. */
    releasePromiseReservations: async function (request, evidence) {
        if (this.config().releaseInventoryReservations === false) return { skipped: true, reason: 'INVENTORY_RELEASE_DISABLED', released: [], failed: [] };
        let reservations = this.reservations(request).filter((reservation) => reservation && reservation.code);
        if (!reservations.length) return { released: [], failed: [], count: 0 };
        if (!SERVICE.DefaultInventoryPromiseReservationOrchestrationService ||
            typeof SERVICE.DefaultInventoryPromiseReservationOrchestrationService.release !== 'function') {
            throw this.error('Inventory Promise Reservation release orchestration is unavailable');
        }
        let released = [];
        let failed = [];
        for (let reservation of reservations) {
            try {
                let result = await SERVICE.DefaultInventoryPromiseReservationOrchestrationService.release({
                    tenant: request.tenant,
                    authData: request.authData,
                    enterpriseCode: evidence.entCode,
                    promiseReservation: {
                        code: reservation.code,
                        state: this.config().inventoryReleaseState || 'RELEASED',
                        reasonCode: this.config().inventoryReleaseReasonCode || 'CHECKOUT_PLACEMENT_FAILED',
                    },
                });
                released.push({
                    code: result.code || reservation.code,
                    promiseCode: result.promiseCode || reservation.promiseCode,
                    state: result.state || this.config().inventoryReleaseState || 'RELEASED',
                });
            } catch (error) {
                failed.push({
                    code: reservation.code,
                    failureCode: error.code || 'INVENTORY_RELEASE_FAILED',
                    failureMessage: String(error.message || 'Inventory release failed').slice(0, Number(this.config().failureMessageLimit || 240)),
                });
            }
        }
        return { released: released, failed: failed, count: released.length };
    },
    /** Cancels Fulfillment-owned consignments through Fulfillment; Order never mutates shipment lifecycle directly. */
    cancelFulfillmentReleases: async function (request) {
        if (this.config().cancelFulfillmentReleases === false) return { skipped: true, reason: 'FULFILLMENT_CANCEL_DISABLED', cancelled: [], failed: [] };
        let fulfillmentRelease = request.fulfillmentRelease || request.feedback && request.feedback.fulfillmentRelease;
        if (!fulfillmentRelease || !this.items(fulfillmentRelease.consignments).length) return { cancelled: [], failed: [], count: 0 };
        if (!SERVICE.DefaultFulfillmentReleaseService || typeof SERVICE.DefaultFulfillmentReleaseService.cancelRelease !== 'function') {
            throw this.error('Fulfillment release cancellation service is unavailable');
        }
        return SERVICE.DefaultFulfillmentReleaseService.cancelRelease(Object.assign({}, request, { fulfillmentRelease: fulfillmentRelease }));
    },
    /** Optionally records order-centered failure history when an order projection already exists. */
    recordFailureHistory: async function (request, evidence, failureEvidence) {
        if (!evidence.orderCode || this.config().recordOrderHistory === false) return null;
        if (!SERVICE.DefaultOrderHistoryEntryService || typeof SERVICE.DefaultOrderHistoryEntryService.save !== 'function') return null;
        let model = {
            entCode: evidence.entCode,
            orderCode: evidence.orderCode,
            historyCode: evidence.idempotencyKey + ':placement-failed',
            eventType: 'CHECKOUT_PLACEMENT_FAILED',
            statusTo: this.config().failedOrderStatus || 'PLACEMENT_FAILED',
            actorType: request.authData && request.authData.tokenType === 'service' ? 'SERVICE' : 'EMPLOYEE',
            actorCode: request.authData && (request.authData.principalId || request.authData.code || request.authData.username),
            sourceModule: 'order',
            sourceOperation: 'checkoutPlacementWorkflow.compensatePlacement',
            evidenceCode: evidence.placementCode,
            message: failureEvidence.failureMessage,
        };
        let response = await SERVICE.DefaultOrderHistoryEntryService.save({ tenant: request.tenant, authData: request.authData, model: model });
        return this.items(response)[0] || response;
    },
    /** Records failed or compensating checkout placement run evidence. */
    savePlacementRun: async function (request, evidence, failureEvidence, releaseResult, fulfillmentCancelResult, state) {
        let placementRun = {
            entCode: evidence.entCode,
            placementCode: evidence.placementCode,
            cartCode: evidence.cartCode,
            orderCode: evidence.orderCode,
            workflowCarrierCode: evidence.workflowCarrierCode,
            pipelineName: (((CONFIG.get('order') || {}).checkoutPlacement || {}).pipeline || {}).name || 'checkoutPlacementRunPipeline',
            idempotencyKey: evidence.idempotencyKey,
            state: state,
            currentStep: 'compensatePlacement',
            failureCode: failureEvidence.failureCode,
            failureMessage: failureEvidence.failureMessage,
            evidence: {
                releasedInventoryReservationCount: (releaseResult.released || []).length,
                failedInventoryReservationCount: (releaseResult.failed || []).length,
                releasedInventoryReservations: releaseResult.released || [],
                failedInventoryReservations: releaseResult.failed || [],
                cancelledFulfillmentConsignmentCount: (fulfillmentCancelResult.cancelled || []).length,
                failedFulfillmentConsignmentCount: (fulfillmentCancelResult.failed || []).length,
                cancelledFulfillmentConsignments: fulfillmentCancelResult.cancelled || [],
                failedFulfillmentConsignments: fulfillmentCancelResult.failed || [],
            },
        };
        if (SERVICE.DefaultCheckoutPlacementRunService && typeof SERVICE.DefaultCheckoutPlacementRunService.save === 'function') {
            await SERVICE.DefaultCheckoutPlacementRunService.save({ tenant: request.tenant, authData: request.authData, model: placementRun });
        }
        return placementRun;
    },
    /** Executes owner-delegated compensation for a failed checkout placement. */
    compensate: async function (request) {
        if (this.config().enabled === false) return { skipped: true, reason: 'COMPENSATION_DISABLED' };
        if (!request || !request.tenant || !request.authData || !request.workflowCarrier) {
            throw this.error('Checkout placement compensation requires tenant, auth, and Workflow carrier');
        }
        let source = request.workflowCarrier.sourceDetail || {};
        let projection = request.orderProjection && (request.orderProjection.order || request.orderProjection.result || request.orderProjection);
        let allocationCopy = request.allocationCopy || {};
        let evidence = {
            cartCode: request.cartCode || source.cartCode,
            entCode: request.entCode || source.enterpriseCode || source.entCode,
            orderCode: request.orderCode || source.orderCode || (projection && projection.code) || allocationCopy.orderCode,
            placementCode: request.placementCode || source.placementCode || source.idempotencyKey || request.workflowCarrier.code,
            idempotencyKey: request.idempotencyKey || source.idempotencyKey || request.workflowCarrier.code,
            workflowCarrierCode: request.workflowCarrier.code,
        };
        if (!evidence.cartCode || !evidence.entCode || !evidence.placementCode) throw this.error('Checkout placement compensation evidence is incomplete');
        let failureEvidence = this.failure(request);
        let fulfillmentCancelResult = await this.cancelFulfillmentReleases(request);
        let releaseResult = await this.releasePromiseReservations(request, evidence);
        let historyEntry = await this.recordFailureHistory(request, evidence, failureEvidence);
        let state = (releaseResult.failed || []).length || (fulfillmentCancelResult.failed || []).length ? 'COMPENSATION_FAILED' : 'COMPENSATED';
        let placementRun = await this.savePlacementRun(request, evidence, failureEvidence, releaseResult, fulfillmentCancelResult, state);
        return {
            cartCode: evidence.cartCode,
            orderCode: evidence.orderCode,
            placementCode: evidence.placementCode,
            workflowCarrierCode: evidence.workflowCarrierCode,
            state: state,
            inventoryReleases: releaseResult,
            fulfillmentCancellations: fulfillmentCancelResult,
            historyEntry: historyEntry,
            placementRun: placementRun,
        };
    },
};
