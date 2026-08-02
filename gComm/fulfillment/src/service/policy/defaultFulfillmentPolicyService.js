/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module fulfillment/service/policy/DefaultFulfillmentPolicyService
 * @description Validates safe fulfillment consignment and shipment evidence and builds release drafts from Order delivery evidence.
 * @layer service
 * @owner fulfillment
 * @override Project modules may replace grouping, status policy, carrier selection, and release draft creation without changing Order or Inventory.
 */
module.exports = {
    /** Initializes Fulfillment policy. */
    init: function () { return Promise.resolve(true); },
    /** Completes Fulfillment policy startup. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns layered Fulfillment policy. */
    policy: function () { return ((CONFIG.get('fulfillment') || {}).fulfillmentPolicy) || {}; },
    /** Returns layered return disposition policy. */
    returnDispositionPolicy: function () { return this.policy().returnDisposition || {}; },
    /** Creates a stable Fulfillment policy error. */
    error: function (message) {
        if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(message, null, 'ERR_FUL_00001');
        let error = new Error(message);
        error.code = 'ERR_FUL_00001';
        return error;
    },
    /** Rejects unsafe provider/label/credential fields. */
    assertSafe: function (model) {
        if (JSON.stringify(model || {}).match(/secret|password|credential|apiKey|privateKey|rawLabel|rawProvider|rawCarrier|providerPayload|carrierPayload/i)) {
            throw this.error('Fulfillment evidence must not store provider secrets, raw labels, or raw provider payloads');
        }
    },
    /** Validates safe carrier provider metadata before persistence. */
    prepareCarrierProvider: function (request) {
        let model = Object.assign({}, (request || {}).model || {});
        ['enterpriseCode', 'carrierCode', 'name'].forEach((field) => {
            if (!model[field]) throw this.error('Fulfillment Carrier Provider ' + field + ' is required');
        });
        if (!(this.policy().carrierProviderStatuses || []).includes(model.status || 'ACTIVE')) {
            throw this.error('Fulfillment Carrier Provider status is unsupported');
        }
        if (!(this.policy().carrierProviderTypes || []).includes(model.providerType || 'CARRIER')) {
            throw this.error('Fulfillment Carrier Provider type is unsupported');
        }
        this.assertSafe(model);
        model.status = model.status || 'ACTIVE';
        model.providerType = model.providerType || 'CARRIER';
        model.supportsLabels = model.supportsLabels === true;
        model.supportsTracking = model.supportsTracking === true;
        request.model = model;
        return model;
    },
    /** Validates safe consignment evidence before persistence. */
    prepareConsignment: function (request) {
        let model = Object.assign({}, (request || {}).model || {});
        ['enterpriseCode', 'consignmentCode', 'idempotencyKey', 'orderCode', 'deliveryGroupCode'].forEach((field) => {
            if (!model[field]) throw this.error('Fulfillment Consignment ' + field + ' is required');
        });
        if (!Array.isArray(model.allocationCodes) || !model.allocationCodes.length) {
            throw this.error('Fulfillment Consignment allocationCodes are required');
        }
        if (!(this.policy().consignmentStatuses || []).includes(model.status || this.policy().defaultConsignmentStatus || 'RELEASED')) {
            throw this.error('Fulfillment Consignment status is unsupported');
        }
        this.assertSafe(model);
        model.status = model.status || this.policy().defaultConsignmentStatus || 'RELEASED';
        model.releasedAt = model.releasedAt || new Date();
        request.model = model;
        return model;
    },
    /** Validates safe shipment evidence before persistence. */
    prepareShipment: function (request) {
        let model = Object.assign({}, (request || {}).model || {});
        ['enterpriseCode', 'shipmentCode', 'idempotencyKey', 'consignmentCode', 'orderCode'].forEach((field) => {
            if (!model[field]) throw this.error('Fulfillment Shipment ' + field + ' is required');
        });
        if (!(this.policy().shipmentStatuses || []).includes(model.status || 'CREATED')) {
            throw this.error('Fulfillment Shipment status is unsupported');
        }
        this.assertSafe(model);
        model.status = model.status || 'CREATED';
        request.model = model;
        return model;
    },
    /** Validates safe warehouse task evidence before persistence. */
    prepareWarehouseTask: function (request) {
        let model = Object.assign({}, (request || {}).model || {});
        ['enterpriseCode', 'taskCode', 'idempotencyKey', 'taskType', 'consignmentCode', 'orderCode'].forEach((field) => {
            if (!model[field]) throw this.error('Fulfillment Warehouse Task ' + field + ' is required');
        });
        if (!(this.policy().warehouseTaskTypes || []).includes(model.taskType)) {
            throw this.error('Fulfillment Warehouse Task type is unsupported');
        }
        if (!(this.policy().warehouseTaskStatuses || []).includes(model.status || 'OPEN')) {
            throw this.error('Fulfillment Warehouse Task status is unsupported');
        }
        this.assertSafe(model);
        model.status = model.status || 'OPEN';
        request.model = model;
        return model;
    },
    /** Validates safe tracking event evidence before persistence. */
    prepareTrackingEvent: function (request) {
        let model = Object.assign({}, (request || {}).model || {});
        ['enterpriseCode', 'eventCode', 'idempotencyKey', 'shipmentCode', 'consignmentCode', 'orderCode', 'normalizedEventType'].forEach((field) => {
            if (!model[field]) throw this.error('Fulfillment Tracking Event ' + field + ' is required');
        });
        if (!(this.policy().trackingEventTypes || []).includes(model.normalizedEventType)) {
            throw this.error('Fulfillment Tracking Event type is unsupported');
        }
        if (!(this.policy().trackingEventStatuses || []).includes(model.status || 'ACCEPTED')) {
            throw this.error('Fulfillment Tracking Event status is unsupported');
        }
        this.assertSafe(model);
        model.status = model.status || 'ACCEPTED';
        request.model = model;
        return model;
    },
    /** Validates safe return request evidence before persistence. */
    prepareReturnRequest: function (request) {
        let model = Object.assign({}, (request || {}).model || {});
        ['enterpriseCode', 'returnCode', 'idempotencyKey', 'orderCode', 'returnReasonCode', 'returnType'].forEach((field) => {
            if (!model[field]) throw this.error('Fulfillment Return Request ' + field + ' is required');
        });
        if (!(this.policy().returnTypes || []).includes(model.returnType)) {
            throw this.error('Fulfillment Return Request type is unsupported');
        }
        if (!(this.policy().returnStatuses || []).includes(model.status || 'REQUESTED')) {
            throw this.error('Fulfillment Return Request status is unsupported');
        }
        if (model.dispositionCode) {
            let supported = this.returnDispositionPolicy().supportedDispositionCodes || [];
            if (supported.length && !supported.includes(model.dispositionCode)) {
                throw this.error('Fulfillment Return Request disposition is unsupported');
            }
        }
        if (model.requestedQuantity && !String(model.requestedQuantity).match(/^(0|[1-9][0-9]*)(\.[0-9]+)?$/)) {
            throw this.error('Fulfillment Return Request requestedQuantity must be an exact non-negative decimal string');
        }
        if (model.receivedQuantity && !String(model.receivedQuantity).match(/^(0|[1-9][0-9]*)(\.[0-9]+)?$/)) {
            throw this.error('Fulfillment Return Request receivedQuantity must be an exact non-negative decimal string');
        }
        this.assertSafe(model);
        model.status = model.status || 'REQUESTED';
        model.requestedAt = model.requestedAt || new Date();
        request.model = model;
        return model;
    },
    /** Builds safe Inventory-owned disposition intent without mutating Inventory counters. */
    buildReturnDispositionIntent: function (request, returnRequest) {
        let policy = this.returnDispositionPolicy();
        let inventoryPolicy = policy.inventoryMovement || {};
        let dispositionCode = request.dispositionCode || returnRequest.dispositionCode || policy.defaultDispositionCode || 'INSPECT';
        let supported = policy.supportedDispositionCodes || [];
        if (supported.length && !supported.includes(dispositionCode)) {
            throw this.error('Fulfillment Return Request disposition is unsupported');
        }
        if (inventoryPolicy.enabled === false || !(inventoryPolicy.dispositionsRequiringMovement || []).includes(dispositionCode)) {
            return undefined;
        }
        let movementType = (inventoryPolicy.movementTypeByDisposition || {})[dispositionCode];
        if (!movementType) throw this.error('Fulfillment return disposition movement type is unsupported');
        return {
            ownerModule: inventoryPolicy.ownerModule || 'inventory',
            status: 'PENDING_INVENTORY_MOVEMENT',
            sourceType: 'FULFILLMENT_RETURN',
            sourceCode: returnRequest.returnCode,
            orderCode: returnRequest.orderCode,
            enterpriseCode: returnRequest.enterpriseCode,
            dispositionCode: dispositionCode,
            movementType: movementType,
            reasonCode: [inventoryPolicy.reasonCodePrefix || 'RETURN_DISPOSITION', dispositionCode].join('_'),
            requestedQuantity: returnRequest.requestedQuantity,
            receivedQuantity: request.receivedQuantity || returnRequest.receivedQuantity,
            allocationCodes: returnRequest.allocationCodes || [],
            inventoryAllocationCodes: returnRequest.inventoryAllocationCodes || [],
        };
    },
    /** Validates a governed shipment lifecycle transition. */
    assertShipmentTransition: function (fromStatus, toStatus) {
        let transitions = this.policy().shipmentTransitions || {};
        let allowed = transitions[fromStatus || 'CREATED'] || [];
        if (fromStatus === toStatus) return true;
        if (!allowed.includes(toStatus)) throw this.error('Fulfillment Shipment transition from ' + fromStatus + ' to ' + toStatus + ' is unsupported');
        return true;
    },
    /** Builds safe shipment evidence from one consignment. */
    buildShipmentDraft: function (request, consignment) {
        return this.prepareShipment({
            model: {
                enterpriseCode: request.enterpriseCode || request.entCode || consignment.enterpriseCode,
                shipmentCode: request.shipmentCode,
                idempotencyKey: request.idempotencyKey,
                consignmentCode: consignment.consignmentCode,
                orderCode: request.orderCode || consignment.orderCode,
                carrierCode: request.carrierCode || consignment.carrierCode,
                trackingNumber: request.trackingNumber,
                trackingUrl: request.trackingUrl,
                labelRef: request.labelRef,
                status: 'CREATED',
            },
        });
    },
    /** Applies and validates safe shipment lifecycle transition evidence. */
    transitionShipment: function (request) {
        let current = Object.assign({}, (request || {}).model || {});
        let targetStatus = request.targetStatus;
        if (!targetStatus) throw this.error('Fulfillment Shipment targetStatus is required');
        this.assertShipmentTransition(current.status || 'CREATED', targetStatus);
        let model = Object.assign({}, current, request.patch || {}, { status: targetStatus });
        return this.prepareShipment({ model: model });
    },
    /** Validates a governed warehouse task lifecycle transition. */
    assertWarehouseTaskTransition: function (fromStatus, toStatus) {
        let transitions = this.policy().warehouseTaskTransitions || {};
        let allowed = transitions[fromStatus || 'OPEN'] || [];
        if (fromStatus === toStatus) return true;
        if (!allowed.includes(toStatus)) throw this.error('Fulfillment Warehouse Task transition from ' + fromStatus + ' to ' + toStatus + ' is unsupported');
        return true;
    },
    /** Builds safe warehouse task evidence from one consignment. */
    buildWarehouseTaskDraft: function (request, consignment, taskType) {
        let idempotencyKey = [
            request.idempotencyKey || consignment.idempotencyKey || consignment.consignmentCode,
            taskType,
            request.shipmentCode || consignment.shipmentCode,
        ].filter(Boolean).join('::');
        return this.prepareWarehouseTask({
            model: {
                enterpriseCode: request.enterpriseCode || request.entCode || consignment.enterpriseCode,
                taskCode: request.taskCode || 'warehouseTask::' + idempotencyKey,
                idempotencyKey: idempotencyKey,
                taskType: taskType,
                consignmentCode: consignment.consignmentCode,
                shipmentCode: request.shipmentCode || consignment.shipmentCode,
                orderCode: request.orderCode || consignment.orderCode,
                warehouseCode: request.warehouseCode || consignment.warehouseCode,
                allocationCodes: request.allocationCodes || consignment.allocationCodes,
                inventoryAllocationCodes: request.inventoryAllocationCodes || consignment.inventoryAllocationCodes,
                assignedTo: request.assignedTo,
                priority: request.priority,
                status: 'OPEN',
            },
        });
    },
    /** Applies and validates safe warehouse task lifecycle transition evidence. */
    transitionWarehouseTask: function (request) {
        let current = Object.assign({}, (request || {}).model || {});
        let targetStatus = request.targetStatus;
        if (!targetStatus) throw this.error('Fulfillment Warehouse Task targetStatus is required');
        this.assertWarehouseTaskTransition(current.status || 'OPEN', targetStatus);
        let model = Object.assign({}, current, request.patch || {}, { status: targetStatus });
        return this.prepareWarehouseTask({ model: model });
    },
    /** Maps a normalized tracking event type to a shipment lifecycle status. */
    trackingShipmentStatus: function (eventType) {
        let mappings = this.policy().trackingEventShipmentStatusMap || {};
        return mappings[eventType];
    },
    /** Builds safe tracking event evidence for one shipment. */
    buildTrackingEventDraft: function (request, shipment) {
        let normalizedEventType = request.normalizedEventType;
        let idempotencyKey = [
            request.idempotencyKey || shipment.shipmentCode,
            normalizedEventType,
            request.providerEventCode,
            request.eventTime || request.trackingNumber || shipment.trackingNumber,
        ].filter(Boolean).join('::');
        let appliedShipmentStatus = this.trackingShipmentStatus(normalizedEventType);
        return this.prepareTrackingEvent({
            model: {
                enterpriseCode: request.enterpriseCode || request.entCode || shipment.enterpriseCode,
                eventCode: request.eventCode || 'trackingEvent::' + idempotencyKey,
                idempotencyKey: idempotencyKey,
                shipmentCode: shipment.shipmentCode,
                consignmentCode: request.consignmentCode || shipment.consignmentCode,
                orderCode: request.orderCode || shipment.orderCode,
                carrierCode: request.carrierCode || shipment.carrierCode,
                trackingNumber: request.trackingNumber || shipment.trackingNumber,
                providerEventCode: request.providerEventCode,
                normalizedEventType: normalizedEventType,
                eventTime: request.eventTime || new Date(),
                locationCode: request.locationCode,
                locationLabel: request.locationLabel,
                message: request.message,
                appliedShipmentStatus: appliedShipmentStatus,
                status: 'ACCEPTED',
            },
        });
    },
    /** Builds safe return request evidence from an order/consignment/shipment context. */
    buildReturnRequestDraft: function (request) {
        let idempotencyKey = [
            request.idempotencyKey || request.orderCode,
            request.consignmentCode,
            request.shipmentCode,
            request.returnReasonCode,
            'return',
        ].filter(Boolean).join('::');
        return this.prepareReturnRequest({
            model: {
                enterpriseCode: request.enterpriseCode || request.entCode,
                returnCode: request.returnCode || 'return::' + idempotencyKey,
                idempotencyKey: idempotencyKey,
                orderCode: request.orderCode,
                consignmentCode: request.consignmentCode,
                shipmentCode: request.shipmentCode,
                returnReasonCode: request.returnReasonCode,
                returnType: request.returnType || 'CUSTOMER_RETURN',
                dispositionCode: request.dispositionCode,
                refundPolicyCode: request.refundPolicyCode,
                allocationCodes: request.allocationCodes,
                inventoryAllocationCodes: request.inventoryAllocationCodes,
                itemCodes: request.itemCodes,
                requestedQuantity: request.requestedQuantity,
                status: 'REQUESTED',
            },
        });
    },
    /** Builds an idempotent consignment draft for one order delivery group and its allocations. */
    buildConsignmentDraft: function (request, deliveryGroup, allocations) {
        let idempotencyKey = [
            request.idempotencyKey || request.workflowCarrier && request.workflowCarrier.code || request.orderCode,
            request.orderCode,
            deliveryGroup.deliveryGroupCode,
            'fulfillmentRelease',
        ].filter(Boolean).join('::');
        return this.prepareConsignment({
            model: {
                enterpriseCode: request.entCode || request.enterpriseCode || deliveryGroup.entCode || deliveryGroup.enterpriseCode,
                consignmentCode: 'consignment::' + idempotencyKey,
                idempotencyKey: idempotencyKey,
                orderCode: request.orderCode || deliveryGroup.orderCode,
                deliveryGroupCode: deliveryGroup.deliveryGroupCode,
                deliveryModeCode: deliveryGroup.deliveryModeCode,
                carrierCode: deliveryGroup.carrierCode,
                warehouseCode: deliveryGroup.warehouseCode,
                allocationCodes: (allocations || []).map((allocation) => allocation.allocationCode).filter(Boolean),
                inventoryAllocationCodes: (allocations || []).map((allocation) => allocation.inventoryAllocationCode).filter(Boolean),
                status: this.policy().defaultConsignmentStatus || 'RELEASED',
            },
        });
    },
    /** Rejects destructive Fulfillment evidence deletion. */
    rejectHardDelete: function () {
        return Promise.reject(this.error('Fulfillment evidence cannot be hard-deleted; use lifecycle states'));
    },
};
