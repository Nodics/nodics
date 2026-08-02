/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiAssistant/config/properties
 * @description Defines fail-closed, layered defaults for provider-neutral Assistant behavior.
 * @layer config
 * @owner aiAssistant
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    backofficeCapabilities: {
        aiAssistant: {
            enabled: true, capabilityId: 'ai-assistant', displayName: 'Axis Assistant',
            category: 'platform', icon: 'assistant', contractVersion: 1,
            minimumClientContractVersion: 1, roles: ['ASSISTANT_PROVIDER'],
            discovery: { openApiPath: '/nodics/system/v0/contract/openapi/internal', contractVersion: 1 },
            requiredPermissions: ['ai.assistant.use'],
            navigation: [{ id: 'assistant', label: 'Axis Assistant', route: '/assistant',
                icon: 'assistant', order: 50, group: { id: 'operations', label: 'Operations', order: 600 },
                perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise'],
                featureState: 'ACTIVE', requiredPermissions: ['ai.assistant.use'] }]
        }
    },
    cache: {
        aiAssistant: {
            channels: {
                executionLease: { enabled: true, fallback: false, engine: 'local', ttl: 120 }
            }
        }
    },
    responseHandler: {
        aiAssistantSseResponseHandler: 'DefaultAiAssistantSseResponseHandlerService'
    },
    aiAssistant: {
        contractVersion: 1,
        enabled: false,
        configuration: {
            rejectUnknownKeys: true,
            snapshotEnabled: true,
            exposeOriginDiagnostics: true
        },
        streaming: {
            transport: 'SSE',
            heartbeatMs: 15000,
            reconnectWindowMs: 120000,
            maxEventBytes: 65536,
            deltaBatchCharacters: 64
        },
        execution: {
            leaseDurationMs: 120000,
            heartbeatIntervalMs: 30000,
            acceptedRecoveryAgeMs: 120000,
            recoveryBatchSize: 25
        },
        confirmations: {
            ttlSeconds: 600,
            executionTimeoutMs: 5000
        },
        observability: {
            heartbeatFailureDegradedWindowMs: 300000
        },
        providerProfile: 'assistantGeneration',
        api: {
            maximumPageSize: 50,
            maximumEventReplaySize: 500
        },
        tools: {
            enabled: false,
            defaultMode: 'DENY',
            maximumCallsPerTurn: 8,
            catalogueModule: 'backoffice',
            catalogueApiVersion: 'v0',
            catalogueApiName: '/bootstrap',
            requestTimeoutMs: 3000,
            maximumCatalogueBytes: 2097152,
            maximumResultBytes: 262144,
            maximumResultCharacters: 32768,
            maximumPlanCharacters: 16384,
            requireTargetAuthorization: true,
            requireConfirmationForMutations: true
        },
        quotas: {
            enabled: true,
            failClosed: true,
            maximumConcurrentTurnsPerPrincipal: 2
        },
        contextOptimization: {
            enabled: true,
            historyStrategy: 'RECENT_WITH_SUMMARY',
            maximumHistoryTokens: 8000,
            preserveSecurityInstructions: true,
            preserveAuthorizationContext: true,
            preserveConfirmationRequirements: true,
            toolResultStrategy: 'SCHEMA_PROJECTION',
            maximumToolResultTokens: 4000
        },
        guardrails: {
            maximumMessageCharacters: 32000,
            rejectPromptInjectionMarkers: false,
            redactionPatterns: [
                {
                    code: 'EMAIL',
                    expression: '\\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}\\b',
                    flags: 'gi',
                    replacement: '[REDACTED_EMAIL]'
                }
            ]
        },
        retention: {
            conversationDays: 30,
            auditDays: 365,
            providerPayloadRetentionEnabled: false
        },
        security: {
            employeeOnly: true,
            deniedPrincipalGroups: ['customerUserGroup'],
            allowBrowserCredentials: false,
            allowInlineSecrets: false,
            allowModelSelfApproval: false,
            allowProviderNativeTools: false
        }
    }
};
