/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module fulfillment/service/shipment/DefaultFulfillmentShipmentLifecycleService
 * @description Owns shipment lifecycle evidence while delegating stock reconciliation to Inventory.
 * @layer service
 * @owner fulfillment
 * @override Project modules may replace label creation, carrier integration, status policy, and dispatch hooks without moving shipment authority into Order or Inventory.
 */
module.exports = {
    /** Initializes shipment lifecycle orchestration. */
    init: function () { return Promise.resolve(true); },
    /** Completes shipment lifecycle orchestration startup. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns layered fulfillment policy. */
    config: function () { return ((CONFIG.get('fulfillment') || {}).fulfillmentPolicy) || {}; },
    /** Creates a stable shipment lifecycle error. */
    error: function (message) {
        if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(message, null, 'ERR_FUL_00003');
        let error = new Error(message);
        error.code = 'ERR_FUL_00003';
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
    /** Loads one consignment by code unless the caller already supplied it. */
    loadConsignment: async function (request) {
        if (request.consignment) return request.consignment;
        if (!request.consignmentCode) throw this.error('Shipment lifecycle requires consignmentCode');
        if (!SERVICE.DefaultFulfillmentConsignmentService || typeof SERVICE.DefaultFulfillmentConsignmentService.get !== 'function') {
            throw this.error('Fulfillment consignment generated service is unavailable');
        }
        let response = await SERVICE.DefaultFulfillmentConsignmentService.get({
            tenant: request.tenant,
            authData: request.authData,
            query: { consignmentCode: request.consignmentCode },
            searchOptions: { limit: 2 },
        });
        let consignments = this.items(response);
        if (consignments.length > 1) throw this.error('Shipment lifecycle resolved duplicate consignments');
        if (!consignments[0]) throw this.error('Shipment lifecycle consignment was not found');
        return consignments[0];
    },
    /** Loads one shipment by shipment or idempotency identity. */
    loadShipment: async function (request) {
        if (request.shipment) return request.shipment;
        if (!SERVICE.DefaultFulfillmentShipmentService || typeof SERVICE.DefaultFulfillmentShipmentService.get !== 'function') {
            throw this.error('Fulfillment shipment generated service is unavailable');
        }
        let query = request.shipmentCode ? { shipmentCode: request.shipmentCode } :
            request.idempotencyKey ? { idempotencyKey: request.idempotencyKey } : undefined;
        if (!query) throw this.error('Shipment lifecycle requires shipmentCode or idempotencyKey');
        let response = await SERVICE.DefaultFulfillmentShipmentService.get({
            tenant: request.tenant,
            authData: request.authData,
            query: query,
            searchOptions: { limit: 2 },
        });
        let shipments = this.items(response);
        if (shipments.length > 1) throw this.error('Shipment lifecycle resolved duplicate shipments');
        return shipments[0];
    },
    /** Persists shipment evidence through the generated Fulfillment service. */
    saveShipment: async function (request, shipment) {
        if (!SERVICE.DefaultFulfillmentShipmentService || typeof SERVICE.DefaultFulfillmentShipmentService.save !== 'function') {
            throw this.error('Fulfillment shipment generated service is unavailable');
        }
        let response = await SERVICE.DefaultFulfillmentShipmentService.save({
            tenant: request.tenant,
            authData: request.authData,
            model: shipment,
        });
        return this.items(response)[0] || response.result || shipment;
    },
    /** Persists consignment lifecycle evidence through the generated Fulfillment service. */
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
    /** Validates common request authority for shipment lifecycle changes. */
    validateRequest: function (request) {
        if (!request || !request.tenant || !request.authData) throw this.error('Shipment lifecycle requires tenant and auth');
    },
    /** Builds a deterministic shipment idempotency key. */
    shipmentIdempotencyKey: function (request, consignment) {
        return request.idempotencyKey || [consignment.idempotencyKey || consignment.consignmentCode, 'shipment'].filter(Boolean).join('::');
    },
    /** Builds a deterministic shipment code without exposing provider identifiers. */
    shipmentCode: function (request, consignment, idempotencyKey) {
        return request.shipmentCode || consignment.shipmentCode || 'shipment::' + idempotencyKey;
    },
    /** Creates idempotent shipment evidence for one consignment. */
    createShipment: async function (request) {
        this.validateRequest(request);
        let consignment = await this.loadConsignment(request);
        let idempotencyKey = this.shipmentIdempotencyKey(request, consignment);
        let existing = await this.loadShipment(Object.assign({}, request, { idempotencyKey: idempotencyKey }));
        if (existing) return Object.assign({ idempotent: true, consignment: consignment }, existing);
        if (!SERVICE.DefaultFulfillmentPolicyService || typeof SERVICE.DefaultFulfillmentPolicyService.buildShipmentDraft !== 'function') {
            throw this.error('Fulfillment policy service is unavailable');
        }
        let draft = SERVICE.DefaultFulfillmentPolicyService.buildShipmentDraft(Object.assign({}, request, {
            idempotencyKey: idempotencyKey,
            shipmentCode: this.shipmentCode(request, consignment, idempotencyKey),
        }), consignment);
        let shipment = await this.saveShipment(request, draft);
        let updatedConsignment = await this.saveConsignment(request, Object.assign({}, consignment, {
            shipmentCode: shipment.shipmentCode,
            status: consignment.status === 'RELEASED' ? 'PACKED' : consignment.status,
        }));
        return Object.assign({ consignment: updatedConsignment }, shipment);
    },
    /** Applies a shipment transition through Fulfillment policy and generated service. */
    transitionShipment: async function (request, targetStatus, patch) {
        this.validateRequest(request);
        let shipment = await this.loadShipment(request);
        if (!shipment) throw this.error('Shipment lifecycle shipment was not found');
        if (!SERVICE.DefaultFulfillmentPolicyService || typeof SERVICE.DefaultFulfillmentPolicyService.transitionShipment !== 'function') {
            throw this.error('Fulfillment policy service is unavailable');
        }
        let transitioned = SERVICE.DefaultFulfillmentPolicyService.transitionShipment({
            model: shipment,
            targetStatus: targetStatus,
            patch: patch || {},
        });
        return this.saveShipment(request, transitioned);
    },
    /** Stores safe label/tracking references without raw labels or provider payloads. */
    markLabelled: async function (request) {
        if (SERVICE.DefaultFulfillmentPolicyService && typeof SERVICE.DefaultFulfillmentPolicyService.assertSafe === 'function') {
            SERVICE.DefaultFulfillmentPolicyService.assertSafe(request);
        }
        return this.transitionShipment(request, 'LABELLED', {
            labelRef: request.labelRef,
            trackingNumber: request.trackingNumber,
            trackingUrl: request.trackingUrl,
        });
    },
    /** Delegates Inventory-owned allocation fulfillment reconciliation for this consignment. */
    fulfillInventoryAllocations: async function (request, consignment) {
        let allocationCodes = this.items(request.inventoryAllocationCodes || consignment.inventoryAllocationCodes);
        if (!allocationCodes.length) return [];
        if (!SERVICE.DefaultStockAllocationIntentService || typeof SERVICE.DefaultStockAllocationIntentService.fulfill !== 'function') {
            throw this.error('Inventory allocation fulfillment intent service is unavailable');
        }
        let fulfilled = [];
        for (let code of allocationCodes) {
            let response = await SERVICE.DefaultStockAllocationIntentService.fulfill({
                tenant: request.tenant,
                authData: request.authData,
                enterpriseCode: request.enterpriseCode || request.entCode || consignment.enterpriseCode,
                body: { code: code },
            });
            fulfilled.push(response && response.data ? response.data : response);
        }
        return fulfilled;
    },
    /** Dispatches shipment and delegates inventory fulfillment reconciliation through Inventory intent service. */
    dispatch: async function (request) {
        this.validateRequest(request);
        if (SERVICE.DefaultFulfillmentPolicyService && typeof SERVICE.DefaultFulfillmentPolicyService.assertSafe === 'function') {
            SERVICE.DefaultFulfillmentPolicyService.assertSafe(request);
        }
        let consignment = await this.loadConsignment(request);
        let inventoryFulfillment = await this.fulfillInventoryAllocations(request, consignment);
        let shippedAt = request.shippedAt || new Date();
        let shipment = await this.transitionShipment(request, 'DISPATCHED', {
            shippedAt: shippedAt,
            trackingNumber: request.trackingNumber,
            trackingUrl: request.trackingUrl,
            inventoryFulfillmentCodes: inventoryFulfillment.map((value) => value && (value.code || value.allocationCode)).filter(Boolean),
        });
        let updatedConsignment = await this.saveConsignment(request, Object.assign({}, consignment, {
            status: 'SHIPPED',
            shipmentCode: shipment.shipmentCode,
        }));
        return {
            shipment: shipment,
            consignment: updatedConsignment,
            inventoryFulfillment: inventoryFulfillment,
        };
    },
    /** Marks a dispatched shipment delivered and closes the owning consignment. */
    deliver: async function (request) {
        this.validateRequest(request);
        let consignment = await this.loadConsignment(request);
        let deliveredAt = request.deliveredAt || new Date();
        let shipment = await this.transitionShipment(request, 'DELIVERED', { deliveredAt: deliveredAt });
        let updatedConsignment = await this.saveConsignment(request, Object.assign({}, consignment, {
            status: 'DELIVERED',
            shipmentCode: shipment.shipmentCode,
        }));
        return {
            shipment: shipment,
            consignment: updatedConsignment,
        };
    },
};
