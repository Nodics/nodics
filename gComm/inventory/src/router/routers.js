/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module inventory/src/router/routers
 * @description Router definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
    inventory: {
        warehouseReference: {
            resolve: {
                secured: true,
                accessGroups: ['userGroup'],
                permissionConfig: 'authSecurity.internalToken.routePermission',
                apiExposure: 'moduleInternal',
                key: '/references/warehouses/resolve',
                method: 'POST',
                controller: 'DefaultInventoryWarehouseReferenceController',
                operation: 'resolve',
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object',
                    required: ['warehouseCode'], additionalProperties: false,
                    properties: { warehouseCode: { type: 'string', minLength: 1, maxLength: 128 } } } } } },
                responses: { '200': { description: 'Safe Inventory Warehouse reference projection' } }
            }
        },
        stockSourcingIntent: {
            evaluate: {
                secured: true,
                accessGroups: ['userGroup'],
                permissionConfig: 'authSecurity.internalToken.routePermission',
                apiExposure: 'moduleInternal',
                key: '/references/stock-sourcing/evaluate',
                method: 'POST',
                controller: 'DefaultStockSourcingIntentController',
                operation: 'evaluate',
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object',
                    required: ['context'], additionalProperties: false,
                    properties: {
                        context: { type: 'object', additionalProperties: false, properties: {
                            countryCode: { oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }] },
                            zoneCode: { oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }] },
                            storeCode: { oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }] },
                            channelCode: { oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }] },
                            customerSegmentCode: { oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }] },
                            fulfillmentType: { oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }] },
                            itemType: { type: 'string' }, itemCode: { type: 'string' }
                        } },
                        at: { type: 'string', format: 'date-time' }
                    }
                } } } },
                responses: { '200': { description: 'Ordered eligible Stock Pool reference projection; not an availability promise' } }
            }
        },
        stockAvailabilityIntent: {
            evaluateOnHand: {
                secured: true,
                accessGroups: ['userGroup'],
                permissionConfig: 'authSecurity.internalToken.routePermission',
                apiExposure: 'moduleInternal',
                key: '/references/stock-availability/evaluate',
                method: 'POST',
                controller: 'DefaultStockAvailabilityIntentController',
                operation: 'evaluate',
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object',
                    required: ['context', 'item'], additionalProperties: false,
                    properties: {
                        context: { type: 'object' },
                        item: { type: 'object', required: ['itemType', 'itemCode', 'unitCode'], additionalProperties: false,
                            properties: { itemType: { type: 'string' }, itemCode: { type: 'string' }, unitCode: { type: 'string' },
                                targetScale: { type: 'integer', minimum: 0, maximum: 18 } } },
                        at: { type: 'string', format: 'date-time' }
                    }
                } } } },
                responses: { '200': { description: 'Exact ON_HAND, reserved, and AVAILABLE_TO_SELL quantities with Warehouse/Balance evidence' } }
            }
        },
        stockReservationIntent: {
            reserveStock: { secured: true, accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission',
                apiExposure: 'moduleInternal', key: '/references/stock-reservations/reserve', method: 'POST',
                controller: 'DefaultStockReservationIntentController', operation: 'reserve',
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', additionalProperties: false,
                    required: ['idempotencyKey', 'stockCode', 'quantity', 'unitCode', 'reasonCode'], properties: {
                        idempotencyKey: { type: 'string' }, stockCode: { type: 'string' }, quantity: { type: 'string' }, unitCode: { type: 'string' },
                        reasonCode: { type: 'string' }, ttlSeconds: { type: 'integer' }, ownerType: { type: 'string' }, ownerCode: { type: 'string' },
                        correlationId: { type: 'string' } } } } } }, responses: { '200': { description: 'Active idempotent Stock Reservation' } } },
            releaseStock: { secured: true, accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission',
                apiExposure: 'moduleInternal', key: '/references/stock-reservations/release', method: 'POST',
                controller: 'DefaultStockReservationIntentController', operation: 'release',
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', additionalProperties: false,
                    properties: { code: { type: 'string' }, idempotencyKey: { type: 'string' } } } } } }, responses: { '200': { description: 'Released Stock Reservation' } } },
            cancelStock: { secured: true, accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission',
                apiExposure: 'moduleInternal', key: '/references/stock-reservations/cancel', method: 'POST',
                controller: 'DefaultStockReservationIntentController', operation: 'cancel',
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { '200': { description: 'Cancelled Stock Reservation' } } },
            consumeStock: { secured: true, accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission',
                apiExposure: 'moduleInternal', key: '/references/stock-reservations/consume', method: 'POST',
                controller: 'DefaultStockReservationIntentController', operation: 'consume',
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { '200': { description: 'Consumed reservation awaiting ISSUE movement' } } },
            expireStock: { secured: true, accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission',
                apiExposure: 'moduleInternal', key: '/internal/stock-reservations/expire', method: 'POST',
                controller: 'DefaultStockReservationIntentController', operation: 'expire',
                requestBody: { required: false, content: { 'application/json': { schema: { type: 'object', additionalProperties: false,
                    properties: { at: { type: 'string', format: 'date-time' } } } } } }, responses: { '200': { description: 'Bounded expired reservation batch' } } }
        },
        stockAllocationIntent: {
            allocateDemand: { secured: true, accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'moduleInternal', key: '/references/stock-allocations/allocate', method: 'POST', controller: 'DefaultStockAllocationIntentController', operation: 'allocate', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { '200': { description: 'Demand allocation with Warehouse assignments and backorder remainder' } } },
            cancelAllocation: { secured: true, accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'moduleInternal', key: '/references/stock-allocations/cancel', method: 'POST', controller: 'DefaultStockAllocationIntentController', operation: 'cancel', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { '200': { description: 'Cancelled allocation and released holds' } } },
            releaseAllocation: { secured: true, accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'moduleInternal', key: '/references/stock-allocations/release', method: 'POST', controller: 'DefaultStockAllocationIntentController', operation: 'release', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { '200': { description: 'Released allocation and holds' } } },
            fulfillAllocation: { secured: true, accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'moduleInternal', key: '/references/stock-allocations/fulfill', method: 'POST', controller: 'DefaultStockAllocationIntentController', operation: 'fulfill', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { '200': { description: 'Allocation reconciled from applied Stock ISSUE evidence' } } }
        },
        stockTransferIntent: {
            createTransfer: { secured: true, accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'moduleInternal', key: '/references/stock-transfers/create', method: 'POST', controller: 'DefaultStockTransferIntentController', operation: 'create', responses: { '200': { description: 'Created Stock Transfer' } } },
            dispatchTransfer: { secured: true, accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'moduleInternal', key: '/references/stock-transfers/dispatch', method: 'POST', controller: 'DefaultStockTransferIntentController', operation: 'dispatch', responses: { '200': { description: 'Dispatched transfer quantity' } } },
            receiveTransfer: { secured: true, accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'moduleInternal', key: '/references/stock-transfers/receive', method: 'POST', controller: 'DefaultStockTransferIntentController', operation: 'receive', responses: { '200': { description: 'Received transfer quantity' } } },
            cancelTransfer: { secured: true, accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'moduleInternal', key: '/references/stock-transfers/cancel', method: 'POST', controller: 'DefaultStockTransferIntentController', operation: 'cancel', responses: { '200': { description: 'Cancelled DRAFT transfer' } } },
            transferDiscrepancy: { secured: true, accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'moduleInternal', key: '/references/stock-transfers/discrepancy', method: 'POST', controller: 'DefaultStockTransferIntentController', operation: 'discrepancy', responses: { '200': { description: 'Recorded transfer discrepancy' } } },
            reconcileTransfer: { secured: true, accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'moduleInternal', key: '/references/stock-transfers/reconcile', method: 'POST', controller: 'DefaultStockTransferIntentController', operation: 'reconcile', responses: { '200': { description: 'Reconciled transfer evidence' } } },
            returnTransfer: { secured: true, accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'moduleInternal', key: '/references/stock-transfers/return', method: 'POST', controller: 'DefaultStockTransferIntentController', operation: 'returnTransfer', responses: { '200': { description: 'Created reverse return transfer' } } }
        },
        stockReconciliation: {
            scanInventory: { secured: true, accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'moduleInternal', key: '/internal/stock-reconciliation/scan', method: 'POST', controller: 'DefaultStockReconciliationController', operation: 'scan', responses: { '200': { description: 'Bounded dry-first reconciliation run' } } },
            approveFinding: { secured: true, accessGroups: ['userGroup'], permission: 'inventory.reconciliation.approve', apiExposure: 'inventoryOperations', key: '/stock-reconciliation/findings/approve', method: 'POST', controller: 'DefaultStockReconciliationController', operation: 'approve', responses: { '200': { description: 'Human-approved reconciliation finding' } } },
            repairFinding: { secured: true, accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'moduleInternal', key: '/internal/stock-reconciliation/repair', method: 'POST', controller: 'DefaultStockReconciliationController', operation: 'repair', responses: { '200': { description: 'Approved correction applied through Stock Movement' } } }
        },
        inventoryOperations: {
            listBalances: { secured: true, accessGroups: ['userGroup'], permission: 'inventory.operations.read', apiExposure: 'inventoryOperations', key: '/operations/balances', method: 'GET', controller: 'DefaultInventoryOperationsController', operation: 'balances', responses: { '200': { description: 'Bounded Stock Balance projection' } } },
            listMovements: { secured: true, accessGroups: ['userGroup'], permission: 'inventory.operations.read', apiExposure: 'inventoryOperations', key: '/operations/movements', method: 'GET', controller: 'DefaultInventoryOperationsController', operation: 'movements', responses: { '200': { description: 'Bounded Stock Movement projection' } } },
            listReservations: { secured: true, accessGroups: ['userGroup'], permission: 'inventory.operations.read', apiExposure: 'inventoryOperations', key: '/operations/reservations', method: 'GET', controller: 'DefaultInventoryOperationsController', operation: 'reservations', responses: { '200': { description: 'Bounded Reservation projection' } } },
            listAllocations: { secured: true, accessGroups: ['userGroup'], permission: 'inventory.operations.read', apiExposure: 'inventoryOperations', key: '/operations/allocations', method: 'GET', controller: 'DefaultInventoryOperationsController', operation: 'allocations', responses: { '200': { description: 'Bounded Allocation projection' } } },
            listTransfers: { secured: true, accessGroups: ['userGroup'], permission: 'inventory.operations.read', apiExposure: 'inventoryOperations', key: '/operations/transfers', method: 'GET', controller: 'DefaultInventoryOperationsController', operation: 'transfers', responses: { '200': { description: 'Bounded Transfer projection' } } },
            listReconciliationFindings: { secured: true, accessGroups: ['userGroup'], permission: 'inventory.operations.read', apiExposure: 'inventoryOperations', key: '/operations/reconciliation/findings', method: 'GET', controller: 'DefaultInventoryOperationsController', operation: 'findings', responses: { '200': { description: 'Bounded Reconciliation finding projection' } } }
        },
        movementCheckpointIntent: {
            createCheckpoint: { secured: true, accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'moduleInternal', key: '/internal/stock-checkpoints/create', method: 'POST', controller: 'DefaultStockMovementCheckpointController', operation: 'create', responses: { '200': { description: 'Created immutable Stock Movement checkpoint' } } },
            reconstructBalance: { secured: true, accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'moduleInternal', key: '/internal/stock-checkpoints/reconstruct', method: 'POST', controller: 'DefaultStockMovementCheckpointController', operation: 'reconstruct', responses: { '200': { description: 'Reconstructed on-hand quantity from checkpoint and contiguous Movements' } } }
        },
        externalProviderIntent: {
            invokeProvider: { secured: true, accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'moduleInternal', key: '/internal/inventory-providers/invoke', method: 'POST', controller: 'DefaultInventoryExternalProviderController', operation: 'invoke', responses: { '200': { description: 'Idempotent configured WMS/POS provider operation' } } }
        }
    }
};
