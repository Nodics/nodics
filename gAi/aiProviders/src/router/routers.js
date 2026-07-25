/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiProviders/src/router/routers
 * @description Defines secured AI ledger administration and service-token recovery routes.
 * @layer router
 * @owner aiProviders
 */
module.exports = {
    aiProviders: {
        aiTokenLedgerOperations: {
            providerDiagnostics: {
                secured: true, accessGroups: ['userGroup'], permission: 'ai.ledger.read',
                apiExposure: 'aiOperations', key: '/operations/ai-providers/diagnostics', method: 'GET',
                controller: 'DefaultAiProviderOperationsController', operation: 'diagnostics',
                responses: { '200': { description: 'Sanitized AI provider readiness and bounded telemetry' } }
            },
            budgets: {
                secured: true, accessGroups: ['userGroup'], permission: 'ai.ledger.read',
                apiExposure: 'aiOperations', key: '/operations/ai-ledger/budgets', method: 'GET',
                controller: 'DefaultAiTokenLedgerController', operation: 'budgets',
                responses: { '200': { description: 'Bounded tenant-scoped AI budget accounts' } }
            },
            reservations: {
                secured: true, accessGroups: ['userGroup'], permission: 'ai.ledger.read',
                apiExposure: 'aiOperations', key: '/operations/ai-ledger/reservations', method: 'GET',
                controller: 'DefaultAiTokenLedgerController', operation: 'reservations',
                responses: { '200': { description: 'Bounded tenant-scoped AI reservation evidence' } }
            },
            usage: {
                secured: true, accessGroups: ['userGroup'], permission: 'ai.ledger.read',
                apiExposure: 'aiOperations', key: '/operations/ai-ledger/usage', method: 'GET',
                controller: 'DefaultAiTokenLedgerController', operation: 'usage',
                responses: { '200': { description: 'Bounded immutable AI provider usage evidence' } }
            },
            repairRuns: {
                secured: true, accessGroups: ['userGroup'], permission: 'ai.ledger.read',
                apiExposure: 'aiOperations', key: '/operations/ai-ledger/repair/runs', method: 'GET',
                controller: 'DefaultAiTokenLedgerController', operation: 'repairRuns',
                responses: { '200': { description: 'Bounded tenant-scoped AI ledger repair runs' } }
            },
            repairFindings: {
                secured: true, accessGroups: ['userGroup'], permission: 'ai.ledger.read',
                apiExposure: 'aiOperations', key: '/operations/ai-ledger/repair/findings', method: 'GET',
                controller: 'DefaultAiTokenLedgerController', operation: 'repairFindings',
                responses: { '200': { description: 'Bounded tenant-scoped AI ledger repair findings' } }
            },
            approveRepairFinding: {
                secured: true, accessGroups: ['userGroup'], permission: 'ai.ledger.repair.approve',
                apiExposure: 'aiOperations', key: '/operations/ai-ledger/repair/findings/approve', method: 'POST',
                controller: 'DefaultAiTokenLedgerController', operation: 'approveRepairFinding',
                requestBody: { required: true, content: { 'application/json': { schema: {
                    type: 'object', additionalProperties: false, required: ['findingCode'],
                    properties: {
                        findingCode: { type: 'string', minLength: 1 },
                        note: { type: 'string', maxLength: 2000 }
                    }
                } } } },
                responses: { '200': { description: 'Human-approved deterministic AI ledger repair finding' } }
            },
            metrics: {
                secured: true, accessGroups: ['userGroup'], permission: 'ai.ledger.read',
                apiExposure: 'aiOperations', key: '/operations/ai-ledger/repair/metrics', method: 'GET',
                controller: 'DefaultAiTokenLedgerController', operation: 'metrics',
                responses: { '200': { description: 'Sanitized process-local AI ledger repair diagnostics' } }
            },
            updateBudget: {
                secured: true, accessGroups: ['userGroup'], permission: 'ai.ledger.manage',
                apiExposure: 'aiOperations', key: '/operations/ai-ledger/budgets/update', method: 'POST',
                controller: 'DefaultAiTokenLedgerController', operation: 'updateBudget',
                requestBody: { required: true, content: { 'application/json': { schema: {
                    type: 'object', additionalProperties: false, required: ['budgetCode'],
                    properties: {
                        budgetCode: { type: 'string', minLength: 1 },
                        maximumTokens: { type: 'integer', minimum: 0 },
                        maximumCost: { type: 'string', pattern: '^(0|[1-9][0-9]*)(\\.[0-9]+)?$' }
                    }
                } } } },
                responses: { '200': { description: 'Updated exact AI budget ceiling' } }
            },
            expire: {
                secured: true, accessGroups: ['userGroup'],
                permissionConfig: 'authSecurity.internalToken.routePermission',
                apiExposure: 'moduleInternal', key: '/internal/ai-ledger/reservations/expire', method: 'POST',
                controller: 'DefaultAiTokenLedgerController', operation: 'expire',
                requestBody: { required: false, content: { 'application/json': { schema: {
                    type: 'object', additionalProperties: false,
                    properties: { at: { type: 'string', format: 'date-time' } }
                } } } },
                responses: { '200': { description: 'Bounded expired AI reservation recovery batch' } }
            },
            repairScan: {
                secured: true, accessGroups: ['userGroup'],
                permissionConfig: 'authSecurity.internalToken.routePermission',
                apiExposure: 'moduleInternal', key: '/internal/ai-ledger/repair/scan', method: 'POST',
                controller: 'DefaultAiTokenLedgerController', operation: 'repairScan',
                requestBody: { required: true, content: { 'application/json': { schema: {
                    type: 'object', additionalProperties: false,
                    anyOf: [{ required: ['idempotencyKey'] }, { required: ['scheduleCode'] }],
                    properties: {
                        idempotencyKey: { type: 'string', minLength: 8, maxLength: 256 },
                        scheduleCode: { type: 'string', minLength: 3, maxLength: 128 },
                        dryRun: { type: 'boolean' }
                    }
                } } } },
                responses: { '200': { description: 'Bounded idempotent AI ledger repair scan' } }
            },
            reconcileUncertain: {
                secured: true, accessGroups: ['userGroup'],
                permissionConfig: 'authSecurity.internalToken.routePermission',
                apiExposure: 'moduleInternal', key: '/internal/ai-ledger/repair/uncertain/reconcile', method: 'POST',
                controller: 'DefaultAiTokenLedgerController', operation: 'reconcileUncertain',
                requestBody: { required: true, content: { 'application/json': { schema: {
                    type: 'object', additionalProperties: false,
                    required: ['reservationId', 'providerRequestId', 'evidenceSource', 'usage'],
                    properties: {
                        reservationId: { type: 'string', minLength: 1 },
                        providerRequestId: { type: 'string', minLength: 1 },
                        evidenceSource: { const: 'PROVIDER' },
                        usage: { type: 'object', additionalProperties: false,
                            required: ['inputTokens', 'outputTokens'],
                            properties: {
                                inputTokens: { type: 'integer', minimum: 0 },
                                outputTokens: { type: 'integer', minimum: 0 },
                                cachedInputTokens: { type: 'integer', minimum: 0 },
                                embeddingTokens: { type: 'integer', minimum: 0 }
                            } }
                    }
                } } } },
                responses: { '200': { description: 'Uncertain usage reconciled from positive provider evidence' } }
            },
            applyRepairFinding: {
                secured: true, accessGroups: ['userGroup'],
                permissionConfig: 'authSecurity.internalToken.routePermission',
                apiExposure: 'moduleInternal', key: '/internal/ai-ledger/repair/findings/apply', method: 'POST',
                controller: 'DefaultAiTokenLedgerController', operation: 'applyRepairFinding',
                requestBody: { required: true, content: { 'application/json': { schema: {
                    type: 'object', additionalProperties: false, required: ['findingCode'],
                    properties: { findingCode: { type: 'string', minLength: 1 } }
                } } } },
                responses: { '200': { description: 'Service-executed approved deterministic AI ledger repair' } }
            }
        }
    }
};
