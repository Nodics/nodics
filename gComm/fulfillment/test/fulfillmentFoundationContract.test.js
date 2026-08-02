/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module fulfillment/test/fulfillmentFoundationContract
 * @description Protects Fulfillment as the owner of consignment and shipment evidence, separate from Order, Inventory, and Payment.
 * @layer test
 * @owner fulfillment
 * @override Project modules may customize fulfillment release behavior without adding shipment authority to Order.
 */
const assert = require('assert');

const properties = require('../config/properties');
const schemas = require('../src/schemas/schemas');
const interceptors = require('../src/interceptors/interceptors');
const policyService = require('../src/service/policy/defaultFulfillmentPolicyService');

global.CONFIG = {
    get: (key) => key === 'fulfillment' ? properties.fulfillment : undefined,
};
global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(message, cause, code) {
            super(String(message));
            this.cause = cause;
            this.code = code;
        }
    },
};

assert.strictEqual(properties.fulfillment.fulfillmentPolicy.groupingStrategy, 'DELIVERY_GROUP');
assert.strictEqual(properties.fulfillment.fulfillmentPolicy.carrierProviderStatuses.includes('ACTIVE'), true);
assert.strictEqual(properties.fulfillment.fulfillmentPolicy.labelPolicy.defaultLabelGatewayService, 'DefaultCarrierLabelGatewayService');
assert.strictEqual(properties.fulfillment.fulfillmentPolicy.warehouseTaskTypes.includes('PICK'), true);
assert.strictEqual(properties.fulfillment.fulfillmentPolicy.warehouseTaskPolicy.requireCompletedTasksBeforeDispatch, false);
assert.strictEqual(properties.fulfillment.fulfillmentPolicy.trackingEventTypes.includes('DELIVERED'), true);
assert.strictEqual(properties.fulfillment.fulfillmentPolicy.trackingEventShipmentStatusMap.OUT_FOR_DELIVERY, 'IN_TRANSIT');
assert.strictEqual(properties.fulfillment.fulfillmentPolicy.returnTypes.includes('CUSTOMER_RETURN'), true);
assert.strictEqual(properties.fulfillment.fulfillmentPolicy.returnStatuses.includes('RECEIVED'), true);
assert.strictEqual(properties.fulfillment.fulfillmentPolicy.returnTransitions.APPROVED.includes('PICKUP_REQUESTED'), true);
assert.strictEqual(properties.fulfillment.fulfillmentPolicy.consignmentStatuses.includes('RELEASED'), true);
assert.strictEqual(properties.backofficeCapabilities.fulfillment.navigation[0].workbenchTarget.schemaName, 'fulfillmentConsignment');
assert.strictEqual(properties.backofficeCapabilities.fulfillment.navigation.some((item) => item.workbenchTarget && item.workbenchTarget.schemaName === 'fulfillmentReturnRequest'), true);

assert.strictEqual(schemas.fulfillment.fulfillmentCarrierProvider.router.enabled, false);
assert.strictEqual(schemas.fulfillment.fulfillmentConsignment.router.enabled, false);
assert.strictEqual(schemas.fulfillment.fulfillmentWarehouseTask.router.enabled, false);
assert.strictEqual(schemas.fulfillment.fulfillmentTrackingEvent.router.enabled, false);
assert.strictEqual(schemas.fulfillment.fulfillmentReturnRequest.router.enabled, false);
assert.strictEqual(schemas.fulfillment.fulfillmentShipment.router.enabled, false);
assert.strictEqual(schemas.fulfillment.fulfillmentCarrierProvider.service.enabled, true);
assert.strictEqual(schemas.fulfillment.fulfillmentConsignment.service.enabled, true);
assert.strictEqual(schemas.fulfillment.fulfillmentWarehouseTask.service.enabled, true);
assert.strictEqual(schemas.fulfillment.fulfillmentTrackingEvent.service.enabled, true);
assert.strictEqual(schemas.fulfillment.fulfillmentReturnRequest.service.enabled, true);
assert.strictEqual(schemas.fulfillment.fulfillmentShipment.service.enabled, true);
assert.strictEqual(schemas.fulfillment.fulfillmentCarrierProvider.definition.carrierCode.required, true);
assert.strictEqual(schemas.fulfillment.fulfillmentCarrierProvider.definition.configurationRef.required, false);
assert.strictEqual(schemas.fulfillment.fulfillmentCarrierProvider.definition.secret, undefined);
assert.strictEqual(schemas.fulfillment.fulfillmentConsignment.definition.allocationCodes.type, 'array');
assert.strictEqual(schemas.fulfillment.fulfillmentWarehouseTask.definition.taskType.required, true);
assert.strictEqual(schemas.fulfillment.fulfillmentWarehouseTask.definition.deviceSecret, undefined);
assert.strictEqual(schemas.fulfillment.fulfillmentTrackingEvent.definition.normalizedEventType.required, true);
assert.strictEqual(schemas.fulfillment.fulfillmentTrackingEvent.definition.rawCarrierPayload, undefined);
assert.strictEqual(schemas.fulfillment.fulfillmentReturnRequest.definition.returnCode.required, true);
assert.strictEqual(schemas.fulfillment.fulfillmentReturnRequest.definition.receivedQuantity.type, 'string');
assert.strictEqual(schemas.fulfillment.fulfillmentReturnRequest.definition.inventoryDispositionIntent.type, 'object');
assert.strictEqual(schemas.fulfillment.fulfillmentReturnRequest.definition.rawProviderPayload, undefined);
assert.strictEqual(schemas.fulfillment.fulfillmentShipment.definition.status.default, 'CREATED');
assert.strictEqual(schemas.fulfillment.fulfillmentShipment.definition.idempotencyKey.required, true);
assert.strictEqual(schemas.fulfillment.fulfillmentShipment.definition.rawProviderPayload, undefined);
assert.strictEqual(schemas.fulfillment.fulfillmentShipment.definition.secret, undefined);

assert.strictEqual(interceptors.fulfillmentCarrierProviderPreSavePolicy.handler, 'DefaultFulfillmentPolicyService.prepareCarrierProvider');
assert.strictEqual(interceptors.fulfillmentConsignmentPreSavePolicy.handler, 'DefaultFulfillmentPolicyService.prepareConsignment');
assert.strictEqual(interceptors.fulfillmentShipmentPreSavePolicy.handler, 'DefaultFulfillmentPolicyService.prepareShipment');
assert.strictEqual(interceptors.fulfillmentWarehouseTaskPreSavePolicy.handler, 'DefaultFulfillmentPolicyService.prepareWarehouseTask');
assert.strictEqual(interceptors.fulfillmentTrackingEventPreSavePolicy.handler, 'DefaultFulfillmentPolicyService.prepareTrackingEvent');
assert.strictEqual(interceptors.fulfillmentReturnRequestPreSavePolicy.handler, 'DefaultFulfillmentPolicyService.prepareReturnRequest');
assert.strictEqual(interceptors.fulfillmentConsignmentPreRemovePolicy.handler, 'DefaultFulfillmentPolicyService.rejectHardDelete');
assert.strictEqual(interceptors.fulfillmentCarrierProviderPreRemovePolicy.handler, 'DefaultFulfillmentPolicyService.rejectHardDelete');
assert.strictEqual(interceptors.fulfillmentWarehouseTaskPreRemovePolicy.handler, 'DefaultFulfillmentPolicyService.rejectHardDelete');
assert.strictEqual(interceptors.fulfillmentTrackingEventPreRemovePolicy.handler, 'DefaultFulfillmentPolicyService.rejectHardDelete');
assert.strictEqual(interceptors.fulfillmentReturnRequestPreRemovePolicy.handler, 'DefaultFulfillmentPolicyService.rejectHardDelete');
assert.strictEqual(properties.fulfillment.fulfillmentPolicy.returnDisposition.supportedDispositionCodes.includes('RESTOCK'), true);
assert.strictEqual(properties.fulfillment.fulfillmentPolicy.returnDisposition.inventoryMovement.ownerModule, 'inventory');

const provider = policyService.prepareCarrierProvider({
    model: {
        enterpriseCode: 'enterpriseA',
        carrierCode: 'carrierA',
        name: 'Carrier A',
        supportsLabels: true,
        supportsTracking: true,
    },
});
assert.strictEqual(provider.status, 'ACTIVE');
assert.strictEqual(provider.providerType, 'CARRIER');
assert.strictEqual(provider.supportsLabels, true);

const consignment = policyService.prepareConsignment({
    model: {
        enterpriseCode: 'enterpriseA',
        consignmentCode: 'consignment-1',
        idempotencyKey: 'idem-1',
        orderCode: 'order-1',
        deliveryGroupCode: 'home',
        allocationCodes: ['allocation-1'],
    },
});
assert.strictEqual(consignment.status, 'RELEASED');
assert(consignment.releasedAt instanceof Date);

const task = policyService.prepareWarehouseTask({
    model: {
        enterpriseCode: 'enterpriseA',
        taskCode: 'task-1',
        idempotencyKey: 'idem-task-1',
        taskType: 'PICK',
        consignmentCode: 'consignment-1',
        orderCode: 'order-1',
    },
});
assert.strictEqual(task.status, 'OPEN');

const trackingEvent = policyService.prepareTrackingEvent({
    model: {
        enterpriseCode: 'enterpriseA',
        eventCode: 'event-1',
        idempotencyKey: 'idem-event-1',
        shipmentCode: 'shipment-1',
        consignmentCode: 'consignment-1',
        orderCode: 'order-1',
        normalizedEventType: 'IN_TRANSIT',
    },
});
assert.strictEqual(trackingEvent.status, 'ACCEPTED');

const shipment = policyService.prepareShipment({
    model: {
        enterpriseCode: 'enterpriseA',
        shipmentCode: 'shipment-1',
        idempotencyKey: 'idem-shipment-1',
        consignmentCode: 'consignment-1',
        orderCode: 'order-1',
    },
});
assert.strictEqual(shipment.status, 'CREATED');

const returnRequest = policyService.prepareReturnRequest({
    model: {
        enterpriseCode: 'enterpriseA',
        returnCode: 'return-1',
        idempotencyKey: 'idem-return-1',
        orderCode: 'order-1',
        returnReasonCode: 'DAMAGED',
        returnType: 'CUSTOMER_RETURN',
        requestedQuantity: '1',
    },
});
assert.strictEqual(returnRequest.status, 'REQUESTED');
assert(returnRequest.requestedAt instanceof Date);

assert.throws(
    () => policyService.prepareCarrierProvider({
        model: {
            enterpriseCode: 'enterpriseA',
            carrierCode: 'carrierB',
            name: 'Carrier B',
            providerPayload: { token: 'never-store' },
        },
    }),
    (error) => error.code === 'ERR_FUL_00001' && error.message.includes('must not store provider secrets')
);

assert.throws(
    () => policyService.prepareWarehouseTask({
        model: {
            enterpriseCode: 'enterpriseA',
            taskCode: 'task-2',
            idempotencyKey: 'idem-task-2',
            taskType: 'PICK',
            consignmentCode: 'consignment-1',
            orderCode: 'order-1',
            deviceSecret: 'never-store',
        },
    }),
    (error) => error.code === 'ERR_FUL_00001' && error.message.includes('must not store provider secrets')
);

assert.throws(
    () => policyService.prepareShipment({
        model: {
            enterpriseCode: 'enterpriseA',
            shipmentCode: 'shipment-2',
            idempotencyKey: 'idem-shipment-2',
            consignmentCode: 'consignment-1',
            orderCode: 'order-1',
            rawProviderPayload: { secret: 'never-store' },
        },
    }),
    (error) => error.code === 'ERR_FUL_00001' && error.message.includes('must not store provider secrets')
);

assert.throws(
    () => policyService.prepareTrackingEvent({
        model: {
            enterpriseCode: 'enterpriseA',
            eventCode: 'event-2',
            idempotencyKey: 'idem-event-2',
            shipmentCode: 'shipment-1',
            consignmentCode: 'consignment-1',
            orderCode: 'order-1',
            normalizedEventType: 'IN_TRANSIT',
            rawCarrierPayload: { token: 'never-store' },
        },
    }),
    (error) => error.code === 'ERR_FUL_00001' && error.message.includes('must not store provider secrets')
);

assert.throws(
    () => policyService.prepareReturnRequest({
        model: {
            enterpriseCode: 'enterpriseA',
            returnCode: 'return-2',
            idempotencyKey: 'idem-return-2',
            orderCode: 'order-1',
            returnReasonCode: 'DAMAGED',
            returnType: 'CUSTOMER_RETURN',
            rawCarrierPayload: { token: 'never-store' },
        },
    }),
    (error) => error.code === 'ERR_FUL_00001' && error.message.includes('must not store provider secrets')
);

console.log('Fulfillment foundation contract validated');
