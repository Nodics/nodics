/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiProviders/src/schemas/schemas
 * @description Defines the authoritative persistent AI budget, reservation, and usage evidence models.
 * @layer schema
 * @owner aiProviders
 * @override Projects may add indexed business dimensions while preserving exact values, immutable usage evidence, and ledger ownership.
 */
module.exports = {
    aiProviders: {
        aiTokenBudget: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false },
            cache: { enabled: false }, event: { enabled: false },
            transaction: { enabled: true, sideEffects: 'none' },
            definition: {
                budgetCode: { type: 'string', required: true }, scopeKey: { type: 'string', required: true },
                scopeLevel: { type: 'string', required: false },
                tenantCode: { type: 'string', required: true }, enterpriseCode: { type: 'string', required: false },
                applicationCode: { type: 'string', required: false }, principalCode: { type: 'string', required: false },
                profileCode: { type: 'string', required: true }, providerCode: { type: 'string', required: true },
                modelCode: { type: 'string', required: true }, period: { type: 'string', required: true },
                windowStart: { type: 'date', required: true }, windowEnd: { type: 'date', required: true },
                currencyCode: { type: 'string', required: true }, maximumTokens: { type: 'int', required: true },
                maximumCost: { type: 'string', required: true }, reservedTokens: { type: 'int', required: true, default: 0 },
                consumedTokens: { type: 'int', required: true, default: 0 }, reservedCost: { type: 'string', required: true, default: '0.00000000' },
                consumedCost: { type: 'string', required: true, default: '0.00000000' }, revision: { type: 'int', required: true, default: 0 }
            },
            indexes: {
                common: {
                    tenantCode: { enabled: true, name: 'tenantCode' }, enterpriseCode: { enabled: true, name: 'enterpriseCode' },
                    principalCode: { enabled: true, name: 'principalCode' }, profileCode: { enabled: true, name: 'profileCode' },
                    windowEnd: { enabled: true, name: 'windowEnd' }
                },
                individual: {
                    budgetCode: { enabled: true, name: 'budgetCode', options: { unique: true } },
                    scopeKey: { enabled: true, name: 'scopeKey' }, revision: { enabled: true, name: 'revision' }
                }
            }
        },
        aiTokenReservation: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false },
            definition: {
                reservationCode: { type: 'string', required: true }, idempotencyKey: { type: 'string', required: true },
                requestHash: { type: 'string', required: true }, budgetCode: { type: 'string', required: true },
                budgetCodes: { type: 'array', required: false }, budgetScopes: { type: 'array', required: false },
                tenantCode: { type: 'string', required: true }, enterpriseCode: { type: 'string', required: false },
                applicationCode: { type: 'string', required: false }, principalCode: { type: 'string', required: false },
                state: { type: 'string', required: true }, tokenPlan: { type: 'object', required: true },
                reservedTokens: { type: 'int', required: true }, reservedCost: { type: 'string', required: true },
                actualUsage: { type: 'object', required: false }, actualTokens: { type: 'int', required: false },
                actualCost: { type: 'string', required: false }, currencyCode: { type: 'string', required: true },
                reservedAt: { type: 'date', required: true }, expiresAt: { type: 'date', required: true },
                invokedAt: { type: 'date', required: false }, terminalAt: { type: 'date', required: false },
                failureCode: { type: 'string', required: false }, revision: { type: 'int', required: true, default: 0 }
            },
            indexes: {
                common: {
                    tenantCode: { enabled: true, name: 'tenantCode' }, enterpriseCode: { enabled: true, name: 'enterpriseCode' },
                    budgetCode: { enabled: true, name: 'budgetCode' }, state: { enabled: true, name: 'state' },
                    expiresAt: { enabled: true, name: 'expiresAt' }
                },
                individual: {
                    reservationCode: { enabled: true, name: 'reservationCode', options: { unique: true } },
                    idempotencyKey: { enabled: true, name: 'idempotencyKey' }, requestHash: { enabled: true, name: 'requestHash' }
                }
            }
        },
        aiTokenUsageRecord: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false },
            definition: {
                usageCode: { type: 'string', required: true }, reservationCode: { type: 'string', required: true },
                budgetCode: { type: 'string', required: true }, tenantCode: { type: 'string', required: true },
                budgetCodes: { type: 'array', required: false },
                enterpriseCode: { type: 'string', required: false }, applicationCode: { type: 'string', required: false },
                principalCode: { type: 'string', required: false }, profileCode: { type: 'string', required: true },
                providerCode: { type: 'string', required: true }, modelCode: { type: 'string', required: true },
                usage: { type: 'object', required: true }, totalTokens: { type: 'int', required: true },
                cost: { type: 'string', required: true }, currencyCode: { type: 'string', required: true },
                pricingRevision: { type: 'string', required: true }, configurationRevision: { type: 'string', required: true },
                outcome: { type: 'string', required: true }, recordedAt: { type: 'date', required: true },
                correlationId: { type: 'string', required: false },
                providerRequestId: { type: 'string', required: false }, evidenceSource: { type: 'string', required: false }
            },
            indexes: {
                common: {
                    tenantCode: { enabled: true, name: 'tenantCode' }, enterpriseCode: { enabled: true, name: 'enterpriseCode' },
                    principalCode: { enabled: true, name: 'principalCode' }, providerCode: { enabled: true, name: 'providerCode' },
                    recordedAt: { enabled: true, name: 'recordedAt' }
                },
                individual: {
                    usageCode: { enabled: true, name: 'usageCode', options: { unique: true } },
                    reservationCode: { enabled: true, name: 'reservationCode', options: { unique: true } }
                }
            }
        },
        aiTokenRepairRun: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false },
            definition: {
                runCode: { type: 'string', required: true }, idempotencyKey: { type: 'string', required: true },
                tenantCode: { type: 'string', required: true }, state: { type: 'string', required: true },
                dryRun: { type: 'bool', required: true, default: true }, scannedCount: { type: 'int', required: true, default: 0 },
                findingCount: { type: 'int', required: true, default: 0 }, repairedCount: { type: 'int', required: true, default: 0 },
                cursor: { type: 'string', required: false }, startedAt: { type: 'date', required: true },
                completedAt: { type: 'date', required: false }, failureCode: { type: 'string', required: false }
            },
            indexes: {
                common: { tenantCode: { enabled: true, name: 'tenantCode' }, state: { enabled: true, name: 'state' } },
                individual: {
                    runCode: { enabled: true, name: 'runCode', options: { unique: true } },
                    idempotencyKey: { enabled: true, name: 'idempotencyKey' }
                }
            }
        },
        aiTokenRepairFinding: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false },
            definition: {
                findingCode: { type: 'string', required: true }, runCode: { type: 'string', required: true },
                tenantCode: { type: 'string', required: true }, reservationCode: { type: 'string', required: true },
                budgetCode: { type: 'string', required: true }, type: { type: 'string', required: true },
                severity: { type: 'string', required: true }, state: { type: 'string', required: true },
                expected: { type: 'object', required: true }, actual: { type: 'object', required: true },
                repairable: { type: 'bool', required: true, default: false },
                evidenceRequired: { type: 'bool', required: true, default: false },
                repairMode: { type: 'string', required: false }, approvedBy: { type: 'string', required: false },
                approvedAt: { type: 'date', required: false }, repairedBy: { type: 'string', required: false },
                repairedAt: { type: 'date', required: false }, resolutionNote: { type: 'string', required: false }
            },
            indexes: {
                common: {
                    tenantCode: { enabled: true, name: 'tenantCode' }, runCode: { enabled: true, name: 'runCode' },
                    reservationCode: { enabled: true, name: 'reservationCode' }, state: { enabled: true, name: 'state' },
                    type: { enabled: true, name: 'type' }
                },
                individual: { findingCode: { enabled: true, name: 'findingCode', options: { unique: true } } }
            }
        }
    }
};
