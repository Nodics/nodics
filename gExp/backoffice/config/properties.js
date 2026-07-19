/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module backoffice/config/properties
 * @description Reserves layered defaults for BackOffice registry, discovery, catalogue, and bootstrap policies.
 * @layer config
 * @owner backoffice
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    backofficeRegistry: {
        enabled: true,
        leaseTtlMs: 30000,
        sweepIntervalMs: 5000,
        maxModulesPerRegistration: 512,
        requireBoundServiceIdentity: true,
        store: {
            mode: 'memory',
            moduleName: 'backoffice',
            engineName: 'redis',
            keyPrefix: 'registry:lease:'
        },
        modulePermissions: {},
        compatibility: {
            registryContractVersion: 1,
            minimumClientContractVersion: 1
        },
        discovery: {
            enabled: true,
            timeoutMs: 3000,
            refreshIntervalMs: 300000,
            maxResponseBytes: 5242880,
            maxPaths: 5000,
            maxOperations: 10000,
            allowRedirects: false,
            allowedHosts: []
        },
        availability: {
            enabled: true,
            timeoutMs: 1000,
            refreshIntervalMs: 10000,
            maxConcurrentObservations: 32,
            maxQueuedObservations: 10000,
            failureBackoffMultiplier: 2,
            maxFailureBackoffMs: 60000,
            staleAfterMs: 30000,
            maxResponseBytes: 65536,
            allowRedirects: false,
            allowedHosts: [],
            events: {
                enabled: true,
                emitInitialState: false,
                publisherService: 'DefaultEventService',
                eventName: 'backoffice.availability.changed',
                target: 'backoffice',
                type: 'ASYNC'
            }
        },
        uiComposition: {
            enabled: true,
            providerRole: 'UI_COMPOSITION_PROVIDER',
            preferredModule: undefined
        },
        contractHistory: {
            enabled: true,
            historyLimit: 50,
            retentionPerModule: 25,
            diagnosticsLimit: 1000,
            automaticClassifications: ['INITIAL', 'UNCHANGED', 'NON_BREAKING'],
            approvalClassifications: ['POTENTIALLY_BREAKING', 'BREAKING']
        },
        audit: {
            enabled: true,
            failClosed: false,
            publisherService: undefined
        },
        administration: {
            rejectServiceTokens: true,
            requirePrincipal: true,
            refreshWindowMs: 60000,
            refreshMaxPerWindow: 5,
            idempotencyTtlMs: 60000,
            maxIdempotencyEntries: 1000
        },
        benchmark: {
            registrationModules: 128,
            registryLeases: 2000,
            hostedModulesPerInstance: 64,
            concurrentRefreshRequests: 32,
            maxAdminResultPage: 100,
            maxAdminStoreScans: 3,
            maxAvailabilityProbesPerInstance: 1,
            maxRefreshExecutionsPerIdempotencyKey: 1
        },
        allowedSchemes: ['http', 'https'],
        clientSafeMetadata: ['moduleName', 'instanceId', 'version', 'moduleKind', 'capabilities', 'endpoint', 'healthPath', 'state', 'lastSeenAt', 'backoffice']
    }
};
