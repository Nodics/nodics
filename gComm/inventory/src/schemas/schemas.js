/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module inventory/src/schemas/schemas
 * @description Defines the enterprise-scoped warehouse and recursive warehouse-location foundation.
 * @layer schema
 * @owner inventory
 * @override Later modules may extend fields and behavior while preserving enterprise scope, stable business identity, and hierarchy safety.
 */
module.exports = {
    inventory: {
        warehouse: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false },
            definition: {
                enterpriseCode: { type: 'string', required: true, description: 'Authoritative enterprise owning this warehouse' },
                warehouseCode: { type: 'string', required: true, description: 'Stable business warehouse code unique inside the enterprise' },
                name: { type: 'string', required: true, description: 'Business-facing warehouse name' },
                type: { type: 'string', required: true, default: 'PHYSICAL', description: 'Configured warehouse classification' },
                status: { type: 'string', required: true, default: 'DRAFT', description: 'Governed warehouse lifecycle state' },
                purposes: { type: 'array', required: false, default: [], description: 'Descriptive warehouse purposes without sourcing authority' },
                capabilities: { type: 'array', required: false, default: [], description: 'Supported stock and fulfillment capabilities' },
                countryCode: { type: 'string', required: false, description: 'Country reference for physical or country-bound facilities' },
                timezone: { type: 'string', required: false, description: 'IANA timezone identifier used for operations and effective dates' },
                addressRef: { type: 'string', required: false, description: 'Reference to an address owned by an approved address provider' },
                externalReferences: { type: 'object', required: false, description: 'Non-secret external WMS, ERP, supplier, or facility identifiers' },
                effectiveFrom: { type: 'date', required: false },
                effectiveTo: { type: 'date', required: false }
            },
            indexes: {
                common: { enterpriseCode: { enabled: true, name: 'enterpriseCode' } },
                individual: {
                    warehouseCode: { enabled: true, name: 'warehouseCode', options: { unique: true } },
                    status: { enabled: true, name: 'status' }, countryCode: { enabled: true, name: 'countryCode' }
                }
            }
        },
        warehouseLocation: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false },
            definition: {
                enterpriseCode: { type: 'string', required: true, description: 'Authoritative enterprise owning the warehouse location' },
                warehouseCode: { type: 'string', required: true, description: 'Owning warehouse business code' },
                locationCode: { type: 'string', required: true, description: 'Stable location code unique inside the warehouse' },
                name: { type: 'string', required: true, description: 'Business-facing warehouse-location name' },
                parentLocationCode: { type: 'string', required: false, description: 'Optional parent location inside the same warehouse' },
                path: { type: 'array', required: true, default: [], description: 'Validated root-to-current location-code path' },
                depth: { type: 'int', required: true, default: 0, description: 'Validated zero-based hierarchy depth' },
                type: { type: 'string', required: true, default: 'STORAGE', description: 'Configured warehouse-location classification' },
                status: { type: 'string', required: true, default: 'DRAFT', description: 'Governed warehouse-location lifecycle state' },
                capabilities: { type: 'array', required: false, default: [], description: 'Operations allowed at this location' },
                restrictions: { type: 'object', required: false, description: 'Non-executable storage and handling constraints' }
            },
            indexes: {
                common: {
                    enterpriseCode: { enabled: true, name: 'enterpriseCode' }, warehouseCode: { enabled: true, name: 'warehouseCode' }
                },
                individual: {
                    locationCode: { enabled: true, name: 'locationCode', options: { unique: true } },
                    parentLocationCode: { enabled: true, name: 'parentLocationCode' }, status: { enabled: true, name: 'status' }
                }
            }
        },
        stockBalance: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false },
            definition: {
                enterpriseCode: { type: 'string', required: true }, warehouseCode: { type: 'string', required: true },
                locationCode: { type: 'string', required: false }, itemType: { type: 'string', required: true }, itemCode: { type: 'string', required: true },
                batchCode: { type: 'string', required: false }, conditionCode: { type: 'string', required: false }, ownerCode: { type: 'string', required: false },
                unitCode: { type: 'string', required: true }, dimensionVector: { type: 'object', required: true },
                quantity: { type: 'string', required: true, default: '0.000000' }, scale: { type: 'int', required: true, default: 6 },
                reservedQuantity: { type: 'string', required: true, default: '0.000000' },
                revision: { type: 'int', required: true, default: 0 }, lastMovementCode: { type: 'string', required: false },
                lastReservationCode: { type: 'string', required: false }
            }, indexes: { common: { enterpriseCode: { enabled: true, name: 'enterpriseCode' }, warehouseCode: { enabled: true, name: 'warehouseCode' },
                itemType: { enabled: true, name: 'itemType' }, itemCode: { enabled: true, name: 'itemCode' } }, individual: {
                unitCode: { enabled: true, name: 'unitCode' }, revision: { enabled: true, name: 'revision' } } }
        },
        stockMovementRecord: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false },
            definition: {
                enterpriseCode: { type: 'string', required: true }, idempotencyKey: { type: 'string', required: true }, stockCode: { type: 'string', required: true },
                movementType: { type: 'string', required: true }, state: { type: 'string', required: true, default: 'PENDING' },
                originalQuantity: { type: 'string', required: true }, originalUnitCode: { type: 'string', required: true },
                normalizedDelta: { type: 'string', required: true }, balanceUnitCode: { type: 'string', required: true }, scale: { type: 'int', required: true },
                conversionCode: { type: 'string', required: false }, geography: { type: 'object', required: false }, roundingMode: { type: 'string', required: true },
                expectedRevision: { type: 'int', required: true }, resultingRevision: { type: 'int', required: false },
                previousQuantity: { type: 'string', required: false }, resultingQuantity: { type: 'string', required: false },
                reasonCode: { type: 'string', required: true }, sourceType: { type: 'string', required: false }, sourceCode: { type: 'string', required: false },
                correlationId: { type: 'string', required: false }, actorCode: { type: 'string', required: false }, failureCode: { type: 'string', required: false }
            }, indexes: { common: { enterpriseCode: { enabled: true, name: 'enterpriseCode' }, stockCode: { enabled: true, name: 'stockCode' } }, individual: {
                idempotencyKey: { enabled: true, name: 'idempotencyKey', options: { unique: true } }, state: { enabled: true, name: 'state' },
                correlationId: { enabled: true, name: 'correlationId' } } }
        },
        stockMovementCheckpoint: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false },
            definition: { enterpriseCode: { type: 'string', required: true }, checkpointCode: { type: 'string', required: true }, stockCode: { type: 'string', required: true }, quantity: { type: 'string', required: true }, reservedQuantity: { type: 'string', required: true }, unitCode: { type: 'string', required: true }, scale: { type: 'int', required: true }, balanceRevision: { type: 'int', required: true }, lastMovementCode: { type: 'string', required: false }, checkpointAt: { type: 'date', required: true }, state: { type: 'string', required: true, default: 'ACTIVE' } },
            indexes: { common: { enterpriseCode: { enabled: true, name: 'enterpriseCode' }, stockCode: { enabled: true, name: 'stockCode' } }, individual: { checkpointCode: { enabled: true, name: 'checkpointCode', options: { unique: true } }, balanceRevision: { enabled: true, name: 'balanceRevision' } } }
        },
        stockProviderOperation: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false },
            definition: { enterpriseCode: { type: 'string', required: true }, operationCode: { type: 'string', required: true }, idempotencyKey: { type: 'string', required: true }, providerCode: { type: 'string', required: true }, providerType: { type: 'string', required: true }, operation: { type: 'string', required: true }, state: { type: 'string', required: true }, correlationId: { type: 'string', required: false }, responseCode: { type: 'string', required: false }, failureCode: { type: 'string', required: false }, startedAt: { type: 'date', required: true }, completedAt: { type: 'date', required: false } },
            indexes: { common: { enterpriseCode: { enabled: true, name: 'enterpriseCode' }, providerCode: { enabled: true, name: 'providerCode' }, state: { enabled: true, name: 'state' } }, individual: { operationCode: { enabled: true, name: 'operationCode', options: { unique: true } }, idempotencyKey: { enabled: true, name: 'idempotencyKey', options: { unique: true } } } }
        },
        stockReservation: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false },
            definition: {
                enterpriseCode: { type: 'string', required: true }, reservationCode: { type: 'string', required: true },
                idempotencyKey: { type: 'string', required: true }, stockCode: { type: 'string', required: true },
                warehouseCode: { type: 'string', required: true }, locationCode: { type: 'string', required: false },
                itemType: { type: 'string', required: true }, itemCode: { type: 'string', required: true },
                quantity: { type: 'string', required: true }, unitCode: { type: 'string', required: true }, scale: { type: 'int', required: true },
                state: { type: 'string', required: true, default: 'PENDING' }, expiresAt: { type: 'date', required: true },
                ownerType: { type: 'string', required: false }, ownerCode: { type: 'string', required: false },
                reasonCode: { type: 'string', required: true }, correlationId: { type: 'string', required: false },
                expectedRevision: { type: 'int', required: true }, resultingRevision: { type: 'int', required: false },
                releaseExpectedRevision: { type: 'int', required: false }, requestedTerminalState: { type: 'string', required: false },
                terminalAt: { type: 'date', required: false }, failureCode: { type: 'string', required: false }
            }, indexes: { common: { enterpriseCode: { enabled: true, name: 'enterpriseCode' }, stockCode: { enabled: true, name: 'stockCode' },
                state: { enabled: true, name: 'state' } }, individual: {
                reservationCode: { enabled: true, name: 'reservationCode', options: { unique: true } },
                idempotencyKey: { enabled: true, name: 'idempotencyKey', options: { unique: true } },
                expiresAt: { enabled: true, name: 'expiresAt' }, correlationId: { enabled: true, name: 'correlationId' } } }
        },
        stockAllocation: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false },
            definition: {
                enterpriseCode: { type: 'string', required: true }, allocationCode: { type: 'string', required: true },
                idempotencyKey: { type: 'string', required: true }, demandType: { type: 'string', required: true },
                demandCode: { type: 'string', required: true }, demandLineCode: { type: 'string', required: true },
                itemType: { type: 'string', required: true }, itemCode: { type: 'string', required: true },
                requestedQuantity: { type: 'string', required: true }, allocatedQuantity: { type: 'string', required: true },
                backorderedQuantity: { type: 'string', required: true }, fulfilledQuantity: { type: 'string', required: true },
                unitCode: { type: 'string', required: true }, scale: { type: 'int', required: true },
                state: { type: 'string', required: true, default: 'PENDING' }, assignments: { type: 'array', required: true },
                revision: { type: 'int', required: true, default: 0 }, reasonCode: { type: 'string', required: true },
                correlationId: { type: 'string', required: false }, failureCode: { type: 'string', required: false },
                terminalAt: { type: 'date', required: false }
            }, indexes: { common: { enterpriseCode: { enabled: true, name: 'enterpriseCode' }, demandCode: { enabled: true, name: 'demandCode' },
                demandLineCode: { enabled: true, name: 'demandLineCode' }, state: { enabled: true, name: 'state' } }, individual: {
                allocationCode: { enabled: true, name: 'allocationCode', options: { unique: true } },
                idempotencyKey: { enabled: true, name: 'idempotencyKey', options: { unique: true } },
                correlationId: { enabled: true, name: 'correlationId' } } }
        },
        stockTransfer: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false },
            definition: {
                enterpriseCode: { type: 'string', required: true }, transferCode: { type: 'string', required: true }, idempotencyKey: { type: 'string', required: true },
                itemType: { type: 'string', required: true }, itemCode: { type: 'string', required: true }, unitCode: { type: 'string', required: true }, scale: { type: 'int', required: true },
                requestedQuantity: { type: 'string', required: true }, dispatchedQuantity: { type: 'string', required: true }, receivedQuantity: { type: 'string', required: true },
                damagedQuantity: { type: 'string', required: true }, lostQuantity: { type: 'string', required: true },
                sourceStockCode: { type: 'string', required: true }, sourceWarehouseCode: { type: 'string', required: true },
                destinationStockCode: { type: 'string', required: true }, destinationWarehouseCode: { type: 'string', required: true },
                parentTransferCode: { type: 'string', required: false },
                state: { type: 'string', required: true, default: 'DRAFT' }, operations: { type: 'array', required: true, default: [] }, revision: { type: 'int', required: true, default: 0 },
                reasonCode: { type: 'string', required: true }, correlationId: { type: 'string', required: false }, failureCode: { type: 'string', required: false }, terminalAt: { type: 'date', required: false }
            }, indexes: { common: { enterpriseCode: { enabled: true, name: 'enterpriseCode' }, state: { enabled: true, name: 'state' }, sourceWarehouseCode: { enabled: true, name: 'sourceWarehouseCode' }, destinationWarehouseCode: { enabled: true, name: 'destinationWarehouseCode' } }, individual: {
                transferCode: { enabled: true, name: 'transferCode', options: { unique: true } }, idempotencyKey: { enabled: true, name: 'idempotencyKey', options: { unique: true } }, correlationId: { enabled: true, name: 'correlationId' } } }
        },
        stockReconciliationRun: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false },
            definition: { enterpriseCode: { type: 'string', required: true }, runCode: { type: 'string', required: true }, idempotencyKey: { type: 'string', required: true },
                state: { type: 'string', required: true, default: 'PENDING' }, dryRun: { type: 'bool', required: true, default: true }, cursor: { type: 'string', required: false },
                scannedCount: { type: 'int', required: true, default: 0 }, findingCount: { type: 'int', required: true, default: 0 }, repairCount: { type: 'int', required: true, default: 0 },
                startedAt: { type: 'date', required: true }, completedAt: { type: 'date', required: false }, failureCode: { type: 'string', required: false } },
            indexes: { common: { enterpriseCode: { enabled: true, name: 'enterpriseCode' }, state: { enabled: true, name: 'state' } }, individual: { runCode: { enabled: true, name: 'runCode', options: { unique: true } }, idempotencyKey: { enabled: true, name: 'idempotencyKey', options: { unique: true } } } }
        },
        stockReconciliationFinding: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false },
            definition: { enterpriseCode: { type: 'string', required: true }, runCode: { type: 'string', required: true }, findingCode: { type: 'string', required: true },
                type: { type: 'string', required: true }, severity: { type: 'string', required: true }, state: { type: 'string', required: true, default: 'OPEN' },
                subjectType: { type: 'string', required: true }, subjectCode: { type: 'string', required: true }, expected: { type: 'object', required: true }, actual: { type: 'object', required: true },
                repairable: { type: 'bool', required: true, default: false }, approvedBy: { type: 'string', required: false }, approvedAt: { type: 'date', required: false },
                approvalMode: { type: 'string', required: false }, workflowCarrierCode: { type: 'string', required: false },
                repairMovementCode: { type: 'string', required: false }, resolutionNote: { type: 'string', required: false }, terminalAt: { type: 'date', required: false } },
            indexes: { common: { enterpriseCode: { enabled: true, name: 'enterpriseCode' }, runCode: { enabled: true, name: 'runCode' }, state: { enabled: true, name: 'state' }, severity: { enabled: true, name: 'severity' } }, individual: { findingCode: { enabled: true, name: 'findingCode', options: { unique: true } }, subjectCode: { enabled: true, name: 'subjectCode' } } }
        },
        stockPool: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false },
            definition: {
                enterpriseCode: { type: 'string', required: true }, poolCode: { type: 'string', required: true },
                name: { type: 'string', required: true }, description: { type: 'string', required: false },
                type: { type: 'string', required: true, default: 'GENERAL' }, status: { type: 'string', required: true, default: 'DRAFT' },
                effectiveFrom: { type: 'date', required: false }, effectiveTo: { type: 'date', required: false }
            }, indexes: { common: { enterpriseCode: { enabled: true, name: 'enterpriseCode' } }, individual: {
                poolCode: { enabled: true, name: 'poolCode', options: { unique: true } }, type: { enabled: true, name: 'type' },
                status: { enabled: true, name: 'status' } } }
        },
        stockPoolMember: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false },
            definition: {
                enterpriseCode: { type: 'string', required: true }, poolCode: { type: 'string', required: true },
                warehouseCode: { type: 'string', required: true }, status: { type: 'string', required: true, default: 'DRAFT' },
                priority: { type: 'int', required: true, default: 100 }, effectiveFrom: { type: 'date', required: false },
                effectiveTo: { type: 'date', required: false }
            }, indexes: { common: { enterpriseCode: { enabled: true, name: 'enterpriseCode' },
                poolCode: { enabled: true, name: 'poolCode' } }, individual: {
                warehouseCode: { enabled: true, name: 'warehouseCode', options: { unique: true } },
                status: { enabled: true, name: 'status' }, priority: { enabled: true, name: 'priority' } } }
        },
        stockSourcingPolicy: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false },
            definition: {
                enterpriseCode: { type: 'string', required: true }, policyCode: { type: 'string', required: true },
                name: { type: 'string', required: true }, description: { type: 'string', required: false },
                status: { type: 'string', required: true, default: 'DRAFT' }, priority: { type: 'int', required: true, default: 100 },
                selectionMode: { type: 'string', required: true, default: 'FIRST_MATCH' },
                effectiveFrom: { type: 'date', required: false }, effectiveTo: { type: 'date', required: false }
            }, indexes: { common: { enterpriseCode: { enabled: true, name: 'enterpriseCode' } }, individual: {
                policyCode: { enabled: true, name: 'policyCode', options: { unique: true } },
                status: { enabled: true, name: 'status' }, priority: { enabled: true, name: 'priority' } } }
        },
        stockSourcingRule: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false },
            definition: {
                enterpriseCode: { type: 'string', required: true }, policyCode: { type: 'string', required: true },
                ruleCode: { type: 'string', required: true }, name: { type: 'string', required: true },
                status: { type: 'string', required: true, default: 'DRAFT' }, priority: { type: 'int', required: true, default: 100 },
                outcome: { type: 'string', required: true, default: 'INCLUDE' },
                criteria: { type: 'object', required: false, default: {}, description: 'Declarative allow-listed sourcing context match' },
                poolCodes: { type: 'array', required: true, description: 'Ordered Stock Pool references; never Stock quantities' },
                effectiveFrom: { type: 'date', required: false }, effectiveTo: { type: 'date', required: false }
            }, indexes: { common: { enterpriseCode: { enabled: true, name: 'enterpriseCode' },
                policyCode: { enabled: true, name: 'policyCode' } }, individual: {
                ruleCode: { enabled: true, name: 'ruleCode', options: { unique: true } },
                status: { enabled: true, name: 'status' }, priority: { enabled: true, name: 'priority' } } }
        }
    }
};
