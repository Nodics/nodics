/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module storefront/config/properties
 * @description Defines generated configurable defaults for storefront.
 * @layer config
 * @owner generated
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    cache: {
        storefront: {
            channels: {
                context: { enabled: true, fallback: true, engine: 'local', ttl: 60 },
                contextAccess: { enabled: true, fallback: false, engine: 'local', ttl: 120 }
            }
        }
    },
    backofficeCapabilities: {
        storefront: {
            enabled: true,
            capabilityId: 'storefront-management',
            displayName: 'Storefronts',
            category: 'experience',
            icon: 'storefront',
            contractVersion: 1,
            minimumClientContractVersion: 1,
            roles: ['UI_COMPOSITION_PROVIDER', 'FUNCTIONAL_CAPABILITY_PROVIDER'],
            discovery: { openApiPath: '/nodics/system/v0/contract/openapi/internal', contractVersion: 1 },
            requiredPermissions: ['storefront.backoffice.read'],
            navigation: [{ id: 'storefronts', label: 'Storefronts', route: '/experience/storefronts', order: 300 }]
        }
    },
    storefront: {
        enterpriseScope: { required: true },
        identity: { separator: '::', maxCodeLength: 128, codePattern: '^[A-Za-z0-9][A-Za-z0-9._-]*$' },
        lifecycle: {
            statuses: ['DRAFT', 'ACTIVE', 'SUSPENDED', 'RETIRED'],
            allowedTransitions: {
                DRAFT: ['ACTIVE', 'RETIRED'],
                ACTIVE: ['SUSPENDED', 'RETIRED'],
                SUSPENDED: ['ACTIVE', 'RETIRED'],
                RETIRED: []
            }
        },
        endpointLifecycle: {
            statuses: ['DRAFT', 'ACTIVE', 'SUSPENDED', 'RETIRED'],
            allowedTransitions: {
                DRAFT: ['ACTIVE', 'RETIRED'],
                ACTIVE: ['SUSPENDED', 'RETIRED'],
                SUSPENDED: ['ACTIVE', 'RETIRED'],
                RETIRED: []
            }
        },
        limits: { maximumStores: 100, maximumContextValues: 100, maximumPayloadBytes: 262144, maximumResultCount: 500 },
        host: { maximumLength: 253, allowedSchemes: ['https'], trustForwardedHost: false },
        traffic: {
            enabled: true,
            requireHttpRateLimit: true,
            coalescingEnabled: true,
            maximumConcurrentResolutions: 64,
            maximumQueuedResolutions: 256,
            maximumInFlightKeys: 512
        },
        cmsSiteReference: {
            moduleName: 'cms',
            apiVersion: 'v0',
            apiName: '/references/sites/resolve',
            requestTimeoutMs: 2000,
            maximumAttempts: 2,
            maximumResponseBytes: 262144,
            preferLocal: true
        },
        storeReference: {
            moduleName: 'store',
            apiVersion: 'v0',
            apiName: '/references/stores/resolve',
            requestTimeoutMs: 2000,
            maximumAttempts: 2,
            maximumResponseBytes: 262144,
            preferLocal: true
        },
        catalogReference: { maximumResults: 2 },
        management: { allowedResources: ['storefronts', 'endpoints'] },
        contextResolution: { defaultTenant: 'default', validateLiveReferences: true },
        deliveryContract: {
            contractVersion: 1,
            minimumClientContractVersion: 1,
            requestHeader: 'x-nodics-client-contract-version',
            responseHeader: 'x-nodics-storefront-contract-version',
            requestIdHeader: 'x-request-id',
            cacheControl: 'private, max-age=0, must-revalidate',
            etagEnabled: true,
            retryAfterSeconds: 1
        },
        contextAccess: {
            enabled: true,
            headerName: 'x-nodics-storefront-context',
            moduleName: 'storefront',
            channelName: 'contextAccess',
            keyPrefix: 'storefrontContextAccess:',
            generationKeyPrefix: 'storefrontContextGeneration:',
            ttlSeconds: 120,
            generationTtlSeconds: 360,
            initialGeneration: '1',
            revokeOnStatuses: ['SUSPENDED', 'RETIRED'],
            audit: {
                enabled: true,
                issueSuccessSampleRate: 0.1,
                publisherService: undefined,
                events: { enabled: false, publisherService: 'DefaultEventService', eventName: 'storefront.context.lifecycle', target: 'storefront', type: 'ASYNC' }
            },
            tokenBytes: 32,
            maximumHandleLength: 256,
            binding: { enabled: false, headerName: 'x-nodics-storefront-binding', minimumLength: 32, maximumLength: 256 },
            audiences: ['cms', 'product', 'pricing', 'inventory'],
            performance: {
                iterations: 500,
                maximumIssueBatchMs: 500,
                maximumIntrospectionBatchMs: 500,
                maximumRefreshBatchMs: 750,
                maximumIndividualRevokeBatchMs: 500,
                maximumBulkRevokeBatchMs: 500,
                maximumAuditBatchMs: 250
            }
        },
        contextCache: {
            enabled: true,
            moduleName: 'storefront',
            channelName: 'context',
            keyPrefix: 'storefrontContext:',
            ttlSeconds: 60,
            negativeCachingEnabled: true,
            negativeTtlSeconds: 5,
            maximumKeyLength: 320,
            contractVersion: 1
        },
        observability: {
            enabled: true,
            readiness: { cacheRequired: false, contributorTimeoutMs: 1000 },
            performance: { cacheHitIterations: 10000, maximumCacheHitBatchMs: 1000, maximumDiagnosticsMs: 100 },
            thresholds: {
                minimumSamples: 20,
                failurePercent: 5,
                cacheErrorPercent: 10,
                dependencyFailurePercent: 10,
                trafficRejected: 1,
                contextAccessRejected: 20,
                contextAccessBulkRevoked: 5,
                contextAuditDeliveryFailures: 1,
                maximumAverageLatencyMs: 250,
                maximumObservedLatencyMs: 2000
            }
        }
    }
};
