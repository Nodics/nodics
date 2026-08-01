/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiProviders/config/properties
 * @description Defines fail-closed layered defaults for the provider-neutral AI gateway.
 * @layer config
 * @owner aiProviders
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    cache: {
        aiProviders: {
            channels: {
                rateLimit: { enabled: true, fallback: false, engine: 'local', ttl: 60 },
                circuitBreaker: { enabled: true, fallback: false, engine: 'local', ttl: 120 },
                responseReuse: { enabled: false, fallback: false, engine: 'local', ttl: 300 },
                embeddingReuse: { enabled: false, fallback: false, engine: 'local', ttl: 86400 }
            }
        }
    },
    aiProviders: {
        contractVersion: 1,
        enabled: false,
        configuration: {
            rejectUnknownKeys: true,
            snapshotEnabled: true,
            exposeOriginDiagnostics: true
        },
        profiles: {
            assistantGeneration: {
                capability: 'GENERATION',
                provider: null,
                model: null,
                fallbackProviders: []
            },
            knowledgeEmbedding: {
                capability: 'EMBEDDING',
                provider: null,
                model: null,
                fallbackProviders: []
            }
        },
        providers: {},
        resilience: {
            fallbackEnabled: false,
            maximumAttempts: 1,
            timeoutMs: 30000,
            circuitBreaker: {
                enabled: true,
                channelName: 'circuitBreaker',
                failureThreshold: 5,
                samplingWindowSeconds: 60,
                openSeconds: 30,
                halfOpenMaximumCalls: 1,
                halfOpenProbeSeconds: 30
            }
        },
        observability: {
            enabled: true,
            maximumSeries: 64
        },
        controls: {
            failClosed: true,
            killSwitches: {
                global: false,
                tenants: {},
                enterprises: {},
                applications: {},
                principals: {},
                profiles: {},
                providers: {},
                models: {},
                capabilities: {}
            },
            rateLimit: {
                enabled: true,
                channelName: 'rateLimit',
                windowSeconds: 60,
                maximumRequests: 60,
                scopeDimensions: ['tenantCode', 'applicationCode', 'principalCode', 'profileCode']
            }
        },
        tokenOptimization: {
            enabled: true,
            failClosed: true,
            requireProviderEstimator: true,
            requireReservation: true,
            costScale: 8,
            reuse: {
                enabled: false,
                responseChannelName: 'responseReuse',
                embeddingChannelName: 'embeddingReuse',
                cacheOnlyDeterministicRequests: true,
                maximumEntryBytes: 262144
            },
            alerts: {
                enabled: false,
                maximumActualCostPerAttempt: '1.00000000',
                eventTarget: 'aiProviders',
                eventName: 'AI_PROVIDER_COST_ALERT'
            },
            profiles: {
                assistantGeneration: {
                    maximumInputTokens: 24000,
                    maximumOutputTokens: 4000,
                    minimumReservedOutputTokens: 1000,
                    maximumEstimatedCost: '0.25000000',
                    currencyCode: 'USD'
                },
                knowledgeEmbedding: {
                    maximumInputTokens: 50000,
                    maximumOutputTokens: 0,
                    minimumReservedOutputTokens: 0,
                    maximumEstimatedCost: '0.25000000',
                    currencyCode: 'USD'
                }
            }
        },
        pricing: {
            models: {}
        },
        ledger: {
            enabled: true,
            failClosed: true,
            reservationTtlSeconds: 300,
            uncertainRetentionSeconds: 86400,
            expiryBatchSize: 100,
            maximumCompareAndSwapAttempts: 5,
            budget: {
                period: 'MONTH',
                scopeDimensions: ['tenantCode', 'enterpriseCode', 'applicationCode', 'principalCode',
                    'profileCode', 'providerCode', 'modelCode'],
                hierarchy: {
                    enabled: false,
                    requireAtomicRepository: true,
                    levels: [
                        { code: 'tenant', dimensions: ['tenantCode'] },
                        { code: 'enterprise', dimensions: ['tenantCode', 'enterpriseCode'] },
                        { code: 'application', dimensions: ['tenantCode', 'enterpriseCode', 'applicationCode'] },
                        { code: 'principal', dimensions: ['tenantCode', 'enterpriseCode', 'applicationCode', 'principalCode'] },
                        { code: 'profile', dimensions: ['tenantCode', 'enterpriseCode', 'applicationCode', 'principalCode', 'profileCode'] },
                        { code: 'provider', dimensions: ['tenantCode', 'enterpriseCode', 'applicationCode', 'principalCode', 'profileCode', 'providerCode'] },
                        { code: 'model', dimensions: ['tenantCode', 'enterpriseCode', 'applicationCode', 'principalCode', 'profileCode', 'providerCode', 'modelCode'] }
                    ]
                },
                defaultMaximumTokens: 1000000,
                defaultMaximumCost: '100.00000000',
                currencyCode: 'USD'
            },
            cache: {
                enabled: false,
                ttlSeconds: 30
            },
            repair: {
                enabled: true,
                dryRunDefault: true,
                batchSize: 100,
                maximumFindings: 5000,
                staleTransitionSeconds: 300,
                scheduleWindowMinutes: 15,
                requireServiceIdentity: true,
                deterministicRepairApprovalMode: 'AUTOMATIC',
                allowUncertainReleaseWithoutProviderEvidence: false,
                metricsEnabled: true
            }
        },
        security: {
            allowCallerProviderOverride: false,
            allowInlineSecrets: false,
            requireSecretReference: true,
            allowProviderNativeTools: false
        }
    }
};
