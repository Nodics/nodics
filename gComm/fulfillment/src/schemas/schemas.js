/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module fulfillment/src/schemas/schemas @description Fulfillment consignment and shipment evidence schemas. @layer schema @owner fulfillment */
const governed = function (definition, indexes, refSchema) {
    return {
        super: 'base',
        model: true,
        service: { enabled: true },
        router: { enabled: false },
        cache: { enabled: false },
        search: { enabled: false },
        event: { enabled: false },
        refSchema: refSchema || {},
        definition: definition,
        indexes: indexes || {},
    };
};

const common = function (defaultStatus) {
    return {
        enterpriseCode: {
            type: 'string',
            required: true,
            description: 'Authenticated enterprise owner of this fulfillment record',
            searchOptions: { enabled: true },
        },
        status: {
            type: 'string',
            required: true,
            default: defaultStatus || 'RELEASED',
            description: 'Fulfillment lifecycle status',
            searchOptions: { enabled: true },
        },
    };
};

module.exports = {
    fulfillment: {
        fulfillmentCarrierProvider: governed(Object.assign(common('ACTIVE'), {
            carrierCode: { type: 'string', required: true, description: 'Safe carrier or provider identity used by Fulfillment', searchOptions: { enabled: true } },
            name: { type: 'string', required: true, description: 'Business-facing carrier provider name', searchOptions: { enabled: true } },
            providerType: { type: 'string', required: true, default: 'CARRIER', description: 'Provider type such as carrier, aggregator, pickup network, or local delivery', searchOptions: { enabled: true } },
            supportedDeliveryModes: { type: 'array', required: false, description: 'Delivery mode codes this provider can serve' },
            supportedCountries: { type: 'array', required: false, description: 'Country codes this provider can serve' },
            supportsLabels: { type: 'bool', required: true, default: false, description: 'Whether this provider can produce label references' },
            supportsTracking: { type: 'bool', required: true, default: false, description: 'Whether this provider can produce or accept tracking references' },
            serviceAdapter: { type: 'string', required: false, description: 'Fulfillment-owned service name used to integrate this provider in a customer module' },
            configurationRef: { type: 'string', required: false, description: 'Safe reference to governed provider configuration. Never store credentials or raw payloads here.' },
        }), {
            common: {
                enterpriseCode: { enabled: true, name: 'enterpriseCode' },
                providerType: { enabled: true, name: 'providerType' },
                status: { enabled: true, name: 'status' },
            },
            individual: {
                carrierCode: { enabled: true, name: 'carrierCode', options: { unique: true } },
            },
        }),
        fulfillmentConsignment: governed(Object.assign(common('RELEASED'), {
            consignmentCode: { type: 'string', required: true, description: 'Stable fulfillment release unit identity', searchOptions: { enabled: true } },
            idempotencyKey: { type: 'string', required: true, description: 'Idempotency key preventing duplicate consignment releases', searchOptions: { enabled: true } },
            orderCode: { type: 'string', required: true, description: 'Order whose delivery evidence produced this consignment', searchOptions: { enabled: true } },
            deliveryGroupCode: { type: 'string', required: true, description: 'Order delivery group released into this consignment', searchOptions: { enabled: true } },
            deliveryModeCode: { type: 'string', required: false, description: 'Delivery mode copied from the order delivery group when available', searchOptions: { enabled: true } },
            carrierCode: { type: 'string', required: false, description: 'Safe carrier identity. Credentials and raw provider payloads are not stored here.', searchOptions: { enabled: true } },
            warehouseCode: { type: 'string', required: false, description: 'Warehouse selected for fulfillment when known', searchOptions: { enabled: true } },
            allocationCodes: { type: 'array', required: true, description: 'Order delivery allocation codes included in this consignment' },
            inventoryAllocationCodes: { type: 'array', required: false, description: 'Inventory allocation evidence references delegated to Inventory' },
            shipmentCode: { type: 'string', required: false, description: 'Primary shipment evidence code when shipment is created', searchOptions: { enabled: true } },
            releasedAt: { type: 'date', required: false, description: 'Timestamp when fulfillment release evidence was created' },
            failureCode: { type: 'string', required: false, description: 'Safe fulfillment failure code' },
            failureMessage: { type: 'string', required: false, description: 'Safe fulfillment failure message without provider secrets or raw labels' },
        }), {
            common: {
                enterpriseCode: { enabled: true, name: 'enterpriseCode' },
                orderCode: { enabled: true, name: 'orderCode' },
                deliveryGroupCode: { enabled: true, name: 'deliveryGroupCode' },
            },
            individual: {
                consignmentCode: { enabled: true, name: 'consignmentCode', options: { unique: true } },
                idempotencyKey: { enabled: true, name: 'idempotencyKey', options: { unique: true } },
                status: { enabled: true, name: 'status' },
                shipmentCode: { enabled: true, name: 'shipmentCode' },
            },
        }, {
            orderCode: {
                enabled: true,
                schemaName: 'order',
                type: 'one',
                propertyName: 'code',
                onTargetDelete: 'RESTRICT',
            },
            deliveryGroupCode: {
                enabled: true,
                schemaName: 'orderDeliveryGroup',
                type: 'one',
                propertyName: 'deliveryGroupCode',
                onTargetDelete: 'RESTRICT',
            },
        }),
        fulfillmentWarehouseTask: governed(Object.assign(common('OPEN'), {
            taskCode: { type: 'string', required: true, description: 'Stable warehouse task identity', searchOptions: { enabled: true } },
            idempotencyKey: { type: 'string', required: true, description: 'Idempotency key preventing duplicate warehouse tasks', searchOptions: { enabled: true } },
            taskType: { type: 'string', required: true, description: 'Task type such as PICK, PACK, or HANDOFF', searchOptions: { enabled: true } },
            consignmentCode: { type: 'string', required: true, description: 'Owning consignment code', searchOptions: { enabled: true } },
            shipmentCode: { type: 'string', required: false, description: 'Shipment code when the task is shipment-specific', searchOptions: { enabled: true } },
            orderCode: { type: 'string', required: true, description: 'Order associated with this warehouse task', searchOptions: { enabled: true } },
            warehouseCode: { type: 'string', required: false, description: 'Warehouse responsible for the task', searchOptions: { enabled: true } },
            allocationCodes: { type: 'array', required: false, description: 'Order delivery allocation codes covered by this task' },
            inventoryAllocationCodes: { type: 'array', required: false, description: 'Inventory allocation references covered by this task' },
            assignedTo: { type: 'string', required: false, description: 'Safe assignee identity or team code', searchOptions: { enabled: true } },
            priority: { type: 'string', required: false, description: 'Business priority for warehouse execution', searchOptions: { enabled: true } },
            startedAt: { type: 'date', required: false },
            completedAt: { type: 'date', required: false },
            failureCode: { type: 'string', required: false, description: 'Safe warehouse task failure code' },
            failureMessage: { type: 'string', required: false, description: 'Safe warehouse task failure message without device, label, or provider secrets' },
        }), {
            common: {
                enterpriseCode: { enabled: true, name: 'enterpriseCode' },
                consignmentCode: { enabled: true, name: 'consignmentCode' },
                shipmentCode: { enabled: true, name: 'shipmentCode' },
                orderCode: { enabled: true, name: 'orderCode' },
                warehouseCode: { enabled: true, name: 'warehouseCode' },
                taskType: { enabled: true, name: 'taskType' },
                status: { enabled: true, name: 'status' },
            },
            individual: {
                taskCode: { enabled: true, name: 'taskCode', options: { unique: true } },
                idempotencyKey: { enabled: true, name: 'idempotencyKey', options: { unique: true } },
            },
        }, {
            consignmentCode: {
                enabled: true,
                schemaName: 'fulfillmentConsignment',
                type: 'one',
                propertyName: 'consignmentCode',
                onTargetDelete: 'RESTRICT',
            },
            shipmentCode: {
                enabled: true,
                schemaName: 'fulfillmentShipment',
                type: 'one',
                propertyName: 'shipmentCode',
                onTargetDelete: 'RESTRICT',
            },
            orderCode: {
                enabled: true,
                schemaName: 'order',
                type: 'one',
                propertyName: 'code',
                onTargetDelete: 'RESTRICT',
            },
        }),
        fulfillmentTrackingEvent: governed(Object.assign(common('ACCEPTED'), {
            eventCode: { type: 'string', required: true, description: 'Stable tracking event identity', searchOptions: { enabled: true } },
            idempotencyKey: { type: 'string', required: true, description: 'Idempotency key preventing duplicate carrier tracking events', searchOptions: { enabled: true } },
            shipmentCode: { type: 'string', required: true, description: 'Shipment receiving this tracking event', searchOptions: { enabled: true } },
            consignmentCode: { type: 'string', required: true, description: 'Consignment receiving this tracking event', searchOptions: { enabled: true } },
            orderCode: { type: 'string', required: true, description: 'Order associated with this tracking event', searchOptions: { enabled: true } },
            carrierCode: { type: 'string', required: false, description: 'Safe carrier identity', searchOptions: { enabled: true } },
            trackingNumber: { type: 'string', required: false, description: 'Carrier tracking number when available', searchOptions: { enabled: true } },
            providerEventCode: { type: 'string', required: false, description: 'Safe carrier event code without raw carrier payload', searchOptions: { enabled: true } },
            normalizedEventType: { type: 'string', required: true, description: 'Normalized carrier event type used by Fulfillment policy', searchOptions: { enabled: true } },
            eventTime: { type: 'date', required: false, description: 'Carrier event time after normalization' },
            locationCode: { type: 'string', required: false, description: 'Safe carrier or warehouse location code', searchOptions: { enabled: true } },
            locationLabel: { type: 'string', required: false, description: 'Safe carrier or warehouse location label' },
            message: { type: 'string', required: false, description: 'Safe operator-facing tracking message without raw carrier payloads or secrets' },
            appliedShipmentStatus: { type: 'string', required: false, description: 'Shipment status applied by this event when mapped by policy', searchOptions: { enabled: true } },
            failureCode: { type: 'string', required: false, description: 'Safe tracking event failure code' },
            failureMessage: { type: 'string', required: false, description: 'Safe tracking event failure message without raw carrier payloads' },
        }), {
            common: {
                enterpriseCode: { enabled: true, name: 'enterpriseCode' },
                shipmentCode: { enabled: true, name: 'shipmentCode' },
                consignmentCode: { enabled: true, name: 'consignmentCode' },
                orderCode: { enabled: true, name: 'orderCode' },
                carrierCode: { enabled: true, name: 'carrierCode' },
                trackingNumber: { enabled: true, name: 'trackingNumber' },
                normalizedEventType: { enabled: true, name: 'normalizedEventType' },
                status: { enabled: true, name: 'status' },
            },
            individual: {
                eventCode: { enabled: true, name: 'eventCode', options: { unique: true } },
                idempotencyKey: { enabled: true, name: 'idempotencyKey', options: { unique: true } },
            },
        }, {
            shipmentCode: {
                enabled: true,
                schemaName: 'fulfillmentShipment',
                type: 'one',
                propertyName: 'shipmentCode',
                onTargetDelete: 'RESTRICT',
            },
            consignmentCode: {
                enabled: true,
                schemaName: 'fulfillmentConsignment',
                type: 'one',
                propertyName: 'consignmentCode',
                onTargetDelete: 'RESTRICT',
            },
            orderCode: {
                enabled: true,
                schemaName: 'order',
                type: 'one',
                propertyName: 'code',
                onTargetDelete: 'RESTRICT',
            },
        }),
        fulfillmentReturnRequest: governed(Object.assign(common('REQUESTED'), {
            returnCode: { type: 'string', required: true, description: 'Stable return request identity', searchOptions: { enabled: true } },
            idempotencyKey: { type: 'string', required: true, description: 'Idempotency key preventing duplicate return requests', searchOptions: { enabled: true } },
            orderCode: { type: 'string', required: true, description: 'Order associated with this return request', searchOptions: { enabled: true } },
            consignmentCode: { type: 'string', required: false, description: 'Fulfillment consignment being returned when known', searchOptions: { enabled: true } },
            shipmentCode: { type: 'string', required: false, description: 'Original outbound shipment being returned when known', searchOptions: { enabled: true } },
            returnShipmentCode: { type: 'string', required: false, description: 'Return pickup or return shipment evidence code when created', searchOptions: { enabled: true } },
            returnReasonCode: { type: 'string', required: true, description: 'Safe return reason code', searchOptions: { enabled: true } },
            returnType: { type: 'string', required: true, default: 'CUSTOMER_RETURN', description: 'Return type such as customer return, failed delivery, exchange, or repair', searchOptions: { enabled: true } },
            dispositionCode: { type: 'string', required: false, description: 'Operational disposition such as RESTOCK, REPAIR, SCRAP, or INSPECT', searchOptions: { enabled: true } },
            dispositionAt: { type: 'date', required: false, description: 'Timestamp when Fulfillment recorded inspection or final disposition' },
            inspectionResult: { type: 'string', required: false, description: 'Safe inspection result or note code. Do not store customer secrets or raw provider payloads.' },
            inventoryDispositionIntent: { type: 'object', required: false, description: 'Safe Inventory-owned movement intent produced by disposition. Fulfillment does not mutate Inventory counters directly.' },
            refundPolicyCode: { type: 'string', required: false, description: 'Payment refund policy code to be interpreted by Payment or Order workflow', searchOptions: { enabled: true } },
            allocationCodes: { type: 'array', required: false, description: 'Order delivery allocation codes being returned' },
            inventoryAllocationCodes: { type: 'array', required: false, description: 'Inventory allocation evidence references connected to returned goods' },
            itemCodes: { type: 'array', required: false, description: 'Safe item codes included in this return request' },
            requestedQuantity: { type: 'string', required: false, description: 'Exact decimal-string quantity requested for return when a single aggregate quantity is useful' },
            receivedQuantity: { type: 'string', required: false, description: 'Exact decimal-string quantity received by fulfillment inspection' },
            requestedAt: { type: 'date', required: false },
            receivedAt: { type: 'date', required: false },
            failureCode: { type: 'string', required: false, description: 'Safe return failure code' },
            failureMessage: { type: 'string', required: false, description: 'Safe return failure message without customer secrets, labels, or raw provider payloads' },
        }), {
            common: {
                enterpriseCode: { enabled: true, name: 'enterpriseCode' },
                orderCode: { enabled: true, name: 'orderCode' },
                consignmentCode: { enabled: true, name: 'consignmentCode' },
                shipmentCode: { enabled: true, name: 'shipmentCode' },
                returnType: { enabled: true, name: 'returnType' },
                status: { enabled: true, name: 'status' },
            },
            individual: {
                returnCode: { enabled: true, name: 'returnCode', options: { unique: true } },
                idempotencyKey: { enabled: true, name: 'idempotencyKey', options: { unique: true } },
            },
        }, {
            orderCode: {
                enabled: true,
                schemaName: 'order',
                type: 'one',
                propertyName: 'code',
                onTargetDelete: 'RESTRICT',
            },
            consignmentCode: {
                enabled: true,
                schemaName: 'fulfillmentConsignment',
                type: 'one',
                propertyName: 'consignmentCode',
                onTargetDelete: 'RESTRICT',
            },
            shipmentCode: {
                enabled: true,
                schemaName: 'fulfillmentShipment',
                type: 'one',
                propertyName: 'shipmentCode',
                onTargetDelete: 'RESTRICT',
            },
        }),
        fulfillmentShipment: governed(Object.assign(common('CREATED'), {
            shipmentCode: { type: 'string', required: true, description: 'Stable shipment identity', searchOptions: { enabled: true } },
            idempotencyKey: { type: 'string', required: true, description: 'Idempotency key preventing duplicate shipment evidence', searchOptions: { enabled: true } },
            consignmentCode: { type: 'string', required: true, description: 'Owning consignment code', searchOptions: { enabled: true } },
            orderCode: { type: 'string', required: true, description: 'Order associated with this shipment', searchOptions: { enabled: true } },
            carrierCode: { type: 'string', required: false, description: 'Safe carrier identity', searchOptions: { enabled: true } },
            trackingNumber: { type: 'string', required: false, description: 'Carrier tracking number when available', searchOptions: { enabled: true } },
            trackingUrl: { type: 'string', required: false, description: 'Safe public tracking URL when available' },
            labelRef: { type: 'string', required: false, description: 'Safe label reference. Raw label payloads stay in governed media or provider systems.' },
            inventoryFulfillmentCodes: { type: 'array', required: false, description: 'Inventory fulfillment reconciliation evidence returned by the Inventory owner' },
            failureCode: { type: 'string', required: false, description: 'Safe shipment failure code' },
            failureMessage: { type: 'string', required: false, description: 'Safe shipment failure message without raw carrier payloads' },
            shippedAt: { type: 'date', required: false },
            deliveredAt: { type: 'date', required: false },
        }), {
            common: {
                enterpriseCode: { enabled: true, name: 'enterpriseCode' },
                orderCode: { enabled: true, name: 'orderCode' },
                consignmentCode: { enabled: true, name: 'consignmentCode' },
            },
            individual: {
                shipmentCode: { enabled: true, name: 'shipmentCode', options: { unique: true } },
                idempotencyKey: { enabled: true, name: 'idempotencyKey', options: { unique: true } },
                trackingNumber: { enabled: true, name: 'trackingNumber' },
                status: { enabled: true, name: 'status' },
            },
        }, {
            consignmentCode: {
                enabled: true,
                schemaName: 'fulfillmentConsignment',
                type: 'one',
                propertyName: 'consignmentCode',
                onTargetDelete: 'RESTRICT',
            },
            orderCode: {
                enabled: true,
                schemaName: 'order',
                type: 'one',
                propertyName: 'code',
                onTargetDelete: 'RESTRICT',
            },
        }),
    },
};
