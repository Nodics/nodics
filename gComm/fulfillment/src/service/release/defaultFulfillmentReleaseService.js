/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module fulfillment/service/release/DefaultFulfillmentReleaseService
 * @description Creates idempotent Fulfillment-owned consignments from Order-owned delivery groups and allocations.
 * @layer service
 * @owner fulfillment
 * @override Project modules may replace grouping, carrier/warehouse selection, external provider release, or Inventory intent integration without moving fulfillment logic into Order.
 */
module.exports = {
    /** Initializes fulfillment release orchestration. */
    init: function () { return Promise.resolve(true); },
    /** Completes fulfillment release orchestration startup. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns layered fulfillment policy. */
    config: function () { return ((CONFIG.get('fulfillment') || {}).fulfillmentPolicy) || {}; },
    /** Creates a stable fulfillment release error. */
    error: function (message) {
        if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(message, null, 'ERR_FUL_00002');
        let error = new Error(message);
        error.code = 'ERR_FUL_00002';
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
    /** Loads order delivery groups from feedback or generated Order service. */
    loadDeliveryGroups: async function (request) {
        if (request.deliveryGroups) return this.items(request.deliveryGroups);
        if (request.allocationCopy && request.allocationCopy.deliveryGroups) return this.items(request.allocationCopy.deliveryGroups);
        if (!SERVICE.DefaultOrderDeliveryGroupService || typeof SERVICE.DefaultOrderDeliveryGroupService.get !== 'function') return [];
        let response = await SERVICE.DefaultOrderDeliveryGroupService.get({
            tenant: request.tenant,
            authData: request.authData,
            query: { orderCode: request.orderCode },
            searchOptions: { limit: Number(this.config().maximumAggregateRecords || 1000) },
        });
        return this.items(response);
    },
    /** Loads order delivery allocations from feedback or generated Order service. */
    loadDeliveryAllocations: async function (request) {
        if (request.deliveryAllocations) return this.items(request.deliveryAllocations);
        if (request.allocationCopy && request.allocationCopy.deliveryAllocations) return this.items(request.allocationCopy.deliveryAllocations);
        if (!SERVICE.DefaultOrderDeliveryAllocationService || typeof SERVICE.DefaultOrderDeliveryAllocationService.get !== 'function') return [];
        let response = await SERVICE.DefaultOrderDeliveryAllocationService.get({
            tenant: request.tenant,
            authData: request.authData,
            query: { orderCode: request.orderCode },
            searchOptions: { limit: Number(this.config().maximumAggregateRecords || 1000) },
        });
        return this.items(response);
    },
    /** Loads an existing consignment by idempotency key. */
    existingConsignment: async function (request, idempotencyKey) {
        if (!SERVICE.DefaultFulfillmentConsignmentService || typeof SERVICE.DefaultFulfillmentConsignmentService.get !== 'function') return undefined;
        let response = await SERVICE.DefaultFulfillmentConsignmentService.get({
            tenant: request.tenant,
            authData: request.authData,
            query: { idempotencyKey: idempotencyKey },
            searchOptions: { limit: 2 },
        });
        let consignments = this.items(response);
        if (consignments.length > 1) throw this.error('Fulfillment release resolved duplicate idempotency records');
        return consignments[0];
    },
    /** Saves one consignment through the generated Fulfillment service. */
    saveConsignment: async function (request, consignment) {
        if (!SERVICE.DefaultFulfillmentConsignmentService || typeof SERVICE.DefaultFulfillmentConsignmentService.save !== 'function') {
            throw this.error('Fulfillment consignment generated service is unavailable');
        }
        let response = await SERVICE.DefaultFulfillmentConsignmentService.save({
            tenant: request.tenant,
            authData: request.authData,
            model: consignment,
        });
        return this.items(response)[0] || response.result || consignment;
    },
    /** Releases one delivery group idempotently. */
    releaseGroup: async function (request, deliveryGroup, allocations) {
        if (!SERVICE.DefaultFulfillmentPolicyService || typeof SERVICE.DefaultFulfillmentPolicyService.buildConsignmentDraft !== 'function') {
            throw this.error('Fulfillment policy service is unavailable');
        }
        let draft = SERVICE.DefaultFulfillmentPolicyService.buildConsignmentDraft(request, deliveryGroup, allocations);
        let existing = await this.existingConsignment(request, draft.idempotencyKey);
        if (existing) return Object.assign({ idempotent: true }, existing);
        return this.saveConsignment(request, draft);
    },
    /** Creates consignment release evidence for all order delivery groups. */
    release: async function (request) {
        if (!request || !request.tenant || !request.authData || !request.orderCode || !request.entCode) {
            throw this.error('Fulfillment release requires tenant, auth, orderCode, and entCode');
        }
        let deliveryGroups = await this.loadDeliveryGroups(request);
        let deliveryAllocations = await this.loadDeliveryAllocations(request);
        if (!deliveryGroups.length) throw this.error('Fulfillment release requires order delivery groups');
        if (!deliveryAllocations.length) throw this.error('Fulfillment release requires order delivery allocations');
        let released = [];
        for (let deliveryGroup of deliveryGroups) {
            let allocations = deliveryAllocations.filter((allocation) => allocation.deliveryGroupCode === deliveryGroup.deliveryGroupCode);
            if (!allocations.length) throw this.error('Fulfillment release group has no delivery allocations');
            released.push(await this.releaseGroup(request, deliveryGroup, allocations));
        }
        return {
            orderCode: request.orderCode,
            consignments: released,
            count: released.length,
        };
    },
    /** Cancels released consignments by delegating lifecycle mutation to the Fulfillment generated service. */
    cancelRelease: async function (request) {
        let consignments = this.items(request && request.fulfillmentRelease && request.fulfillmentRelease.consignments);
        if (!consignments.length) return { cancelled: [], failed: [], count: 0 };
        if (!SERVICE.DefaultFulfillmentConsignmentService || typeof SERVICE.DefaultFulfillmentConsignmentService.save !== 'function') {
            throw this.error('Fulfillment consignment generated service is unavailable');
        }
        let cancelled = [];
        let failed = [];
        for (let consignment of consignments) {
            try {
                let model = Object.assign({}, consignment, { status: 'CANCELLED' });
                let response = await SERVICE.DefaultFulfillmentConsignmentService.save({
                    tenant: request.tenant,
                    authData: request.authData,
                    model: model,
                });
                cancelled.push(this.items(response)[0] || response.result || model);
            } catch (error) {
                failed.push({
                    consignmentCode: consignment.consignmentCode,
                    failureCode: error.code || 'FULFILLMENT_CANCEL_FAILED',
                    failureMessage: String(error.message || 'Fulfillment cancel failed').slice(0, Number(this.config().failureMessageLimit || 240)),
                });
            }
        }
        return { cancelled: cancelled, failed: failed, count: cancelled.length };
    },
};
