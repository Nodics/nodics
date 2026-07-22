/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module inventory/config/properties
 * @description Defines layered warehouse-foundation policy for the inventory capability.
 * @layer config
 * @owner generated
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    cache: {
        inventory: {
            channels: {
                sourcing: { enabled: true, fallback: true, engine: 'local', ttl: 30 },
                availability: { enabled: true, fallback: true, engine: 'local', ttl: 15 }
            }
        }
    },
    inventory: {
        enterpriseScope: { required: true },
        identity: {
            separator: '::',
            maxCodeLength: 128,
            codePattern: '^[A-Za-z0-9][A-Za-z0-9._-]*$'
        },
        warehouse: {
            statuses: ['DRAFT', 'ACTIVE', 'SUSPENDED', 'RETIRED'],
            types: ['PHYSICAL', 'VIRTUAL', 'STORE', 'DARK_STORE', 'DISTRIBUTION_CENTER', 'SUPPLIER', 'DROPSHIP', 'RETURNS', 'TRANSIT'],
            allowedTransitions: {
                DRAFT: ['ACTIVE', 'RETIRED'],
                ACTIVE: ['SUSPENDED', 'RETIRED'],
                SUSPENDED: ['ACTIVE', 'RETIRED'],
                RETIRED: []
            }
        },
        location: {
            maxDepth: 12,
            statuses: ['DRAFT', 'ACTIVE', 'SUSPENDED', 'RETIRED'],
            types: ['RECEIVING', 'STORAGE', 'ZONE', 'AISLE', 'RACK', 'BIN', 'SALES_FLOOR', 'BACK_ROOM', 'PICKUP', 'PACKING', 'RETURNS', 'QUARANTINE', 'DAMAGED', 'TRANSIT', 'VIRTUAL']
        },
        referenceLookup: {
            requireServiceToken: true,
            maximumResultCount: 1
        },
        unitsReference: {
            moduleName: 'units',
            apiVersion: 'v0',
            apiName: '/references/units/convert',
            requestTimeoutMs: 2000,
            maximumAttempts: 2,
            preferLocal: true
        },
        stock: {
            movementTypes: ['RECEIPT', 'ISSUE', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT', 'RETURN', 'DAMAGE', 'CORRECTION'],
            movementStates: ['PENDING', 'APPLIED', 'REJECTED'],
            allowNegative: false,
            defaultScale: 6,
            roundingMode: 'UNNECESSARY',
            maximumRetries: 3
        },
        stockPool: {
            statuses: ['DRAFT', 'ACTIVE', 'SUSPENDED', 'RETIRED'],
            types: ['GENERAL', 'FULFILLMENT', 'PICKUP', 'REPLENISHMENT', 'RETURNS'],
            allowedTransitions: { DRAFT: ['ACTIVE', 'RETIRED'], ACTIVE: ['SUSPENDED', 'RETIRED'],
                SUSPENDED: ['ACTIVE', 'RETIRED'], RETIRED: [] }
        },
        stockPoolMember: {
            statuses: ['DRAFT', 'ACTIVE', 'SUSPENDED', 'RETIRED'],
            minimumPriority: 0,
            maximumPriority: 999999,
            allowedTransitions: { DRAFT: ['ACTIVE', 'RETIRED'], ACTIVE: ['SUSPENDED', 'RETIRED'],
                SUSPENDED: ['ACTIVE', 'RETIRED'], RETIRED: [] }
        },
        stockSourcing: {
            statuses: ['DRAFT', 'ACTIVE', 'SUSPENDED', 'RETIRED'],
            selectionModes: ['FIRST_MATCH', 'COLLECT_MATCHES'],
            ruleOutcomes: ['INCLUDE', 'EXCLUDE'],
            contextKeys: ['countryCode', 'zoneCode', 'storeCode', 'channelCode', 'customerSegmentCode',
                'fulfillmentType', 'itemType', 'itemCode'],
            minimumPriority: 0,
            maximumPriority: 999999,
            maximumPoolsPerRule: 100,
            allowedTransitions: { DRAFT: ['ACTIVE', 'RETIRED'], ACTIVE: ['SUSPENDED', 'RETIRED'],
                SUSPENDED: ['ACTIVE', 'RETIRED'], RETIRED: [] }
        },
        stockSourcingIntent: {
            requireServiceToken: true,
            maximumRequestBytes: 16384,
            maximumContextKeys: 16,
            maximumValuesPerKey: 50,
            maximumValueLength: 256,
            maximumResultCount: 100
        },
        stockSourcingCache: {
            enabled: true,
            moduleName: 'inventory',
            channelName: 'sourcing',
            keyPrefix: 'stockSourcing:',
            ttlSeconds: 30,
            maximumKeyLength: 256,
            cacheExplicitEvaluationTime: false
        },
        stockAvailability: {
            requireServiceToken: true,
            maximumWarehouses: 500,
            maximumBalances: 5000,
            maximumEvidence: 5000,
            defaultScale: 6,
            roundingMode: 'UNNECESSARY'
        },
        storefrontContext: {
            headerName: 'x-nodics-storefront-context',
            moduleName: 'storefront',
            apiVersion: 'v0',
            apiName: '/context/introspect',
            bootstrapTenant: 'default',
            preferLocal: true,
            requestTimeoutMs: 1000,
            maximumAttempts: 1,
            maximumResponseBytes: 32768
        },
        stockAvailabilityCache: {
            enabled: true,
            moduleName: 'inventory',
            channelName: 'availability',
            keyPrefix: 'stockAvailability:',
            ttlSeconds: 15,
            maximumKeyLength: 256,
            cacheExplicitEvaluationTime: false,
            validateEvidenceOnHit: true
        },
        operations: {
            maximumResultCount: 500,
            readPermission: 'inventory.operations.read'
        },
        movementCheckpoint: { batchSize: 1000, requireServiceToken: true },
        externalProviders: {
            enabled: false,
            maximumPayloadBytes: 262144,
            maximumAttempts: 3,
            timeoutMs: 5000,
            providers: {}
        },
        stockReservation: {
            states: ['PENDING', 'ACTIVE', 'RELEASE_PENDING', 'CONSUMED', 'RELEASED', 'EXPIRED', 'CANCELLED', 'REJECTED'],
            defaultTtlSeconds: 900,
            minimumTtlSeconds: 1,
            maximumTtlSeconds: 86400,
            maximumRetries: 3,
            expiryBatchSize: 500,
            requireServiceToken: true
        },
        stockAllocation: {
            states: ['PENDING', 'ALLOCATED', 'PARTIALLY_ALLOCATED', 'BACKORDERED', 'PARTIALLY_FULFILLED', 'FULFILLED', 'RELEASED', 'CANCELLED', 'FAILED'],
            maximumAssignments: 100,
            allowPartial: true,
            requireServiceToken: true
        },
        stockTransfer: {
            states: ['DRAFT', 'IN_TRANSIT', 'PARTIALLY_RECEIVED', 'RECEIVED', 'COMPLETED_WITH_DISCREPANCY', 'CANCELLED', 'RECONCILIATION_REQUIRED'],
            discrepancyTypes: ['DAMAGED', 'LOST', 'REJECTED'],
            maximumOperations: 1000,
            requireServiceToken: true
        },
        stockReconciliation: {
            batchSize: 500,
            maximumFindings: 5000,
            pendingAgeSeconds: 300,
            dryRunDefault: true,
            requireServiceTokenForScan: true,
            approvalPermission: 'inventory.reconciliation.approve',
            repairPermission: 'inventory.reconciliation.repair',
            workflow: {
                enabled: true,
                defaultMode: 'MANUAL',
                manualWorkflowCode: 'stockReconciliationManualFlow',
                automaticWorkflowCode: 'stockReconciliationAutomaticFlow',
                findingModes: { NEGATIVE_BALANCE: 'MANUAL' }
            }
        }
    }
};
