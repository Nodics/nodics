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
    schemaPolicies: {
        backoffice: {
            contractReader: {
                accessGroups: {
                    adminGroup: 10,
                    runtimeConfigViewerUserGroup: 10,
                    runtimeConfigAdminUserGroup: 10,
                    serviceAccountUserGroup: 10
                }
            },
            administrator: {
                accessGroups: {
                    adminGroup: 10,
                    runtimeConfigAdminUserGroup: 10,
                    serviceAccountUserGroup: 10
                }
            }
        }
    },
    backofficeAxisPolicy: {
        code: 'axisEmployeeExperiencePolicy',
        contractVersion: 1,
        screenLockEnabled: true,
        idleTimeoutSeconds: 900,
        minimumIdleTimeoutSeconds: 60,
        maximumIdleTimeoutSeconds: 86400
    },
    backofficeCapabilities: {
        backoffice: {
            enabled: true, capabilityId: 'backoffice-registry', displayName: 'BackOffice Registry', category: 'platform', icon: 'registry',
            contractVersion: 1, minimumClientContractVersion: 1, roles: ['CONTROL_PLANE_PROVIDER'],
            discovery: { openApiPath: '/nodics/system/v0/contract/openapi/internal', contractVersion: 1 },
            requiredPermissions: ['backoffice.registry.view'],
            documentation: [
                {
                    id: 'framework', label: 'Framework', type: 'CMS', route: '/docs/framework', order: 100,
                    connectionModule: 'cms', site: 'axisCmsSite', catalog: 'nodicsDocumentationContentCatalog',
                    defaultPage: '/docs', packCode: 'nodicsDocumentation'
                },
                {
                    id: 'swaggers', label: 'Swaggers', type: 'OPENAPI', route: '/docs/swaggers', order: 200,
                    connectionModule: 'system', openApiPath: '/nodics/system/v0/contract/openapi',
                    swaggerPath: '/nodics/system/v0/contract/swagger'
                },
                {
                    id: 'nodics-axis', label: 'Nodics Axis', type: 'CMS', route: '/docs/nodics-axis', order: 300,
                    connectionModule: 'cms', site: 'axisDocumentationSite', catalog: 'axisDocumentationContentCatalog',
                    defaultPage: '/docs/nodics-axis', packCode: 'axisDocumentation'
                }
            ],
            navigation: [
                { id: 'my-work', label: 'My Work', route: '/workspace/my-work', icon: 'workflow',
                    order: 100, group: { id: 'workspace', label: 'Workspace', order: 100 },
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise'],
                    featureState: 'DISABLED' },
                { id: 'assigned-to-me', parentId: 'my-work', label: 'Assigned to Me',
                    route: '/workspace/my-work/assigned', icon: 'workflow', order: 110,
                    group: { id: 'workspace', label: 'Workspace', order: 100 },
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise'],
                    featureState: 'DISABLED' },
                { id: 'approvals', parentId: 'my-work', label: 'Approvals',
                    route: '/workspace/my-work/approvals', icon: 'workflow', order: 120,
                    group: { id: 'workspace', label: 'Workspace', order: 100 },
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise'],
                    featureState: 'DISABLED' },
                { id: 'returned-work', parentId: 'my-work', label: 'Returned Work',
                    route: '/workspace/my-work/returned', icon: 'workflow', order: 130,
                    group: { id: 'workspace', label: 'Workspace', order: 100 },
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise'],
                    featureState: 'DISABLED' },
                { id: 'started-workflows', parentId: 'my-work', label: 'Workflows I Started',
                    route: '/workspace/my-work/started', icon: 'workflow', order: 140,
                    group: { id: 'workspace', label: 'Workspace', order: 100 },
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise'],
                    featureState: 'DISABLED' },
                { id: 'completed-work', parentId: 'my-work', label: 'Completed Work',
                    route: '/workspace/my-work/completed', icon: 'workflow', order: 150,
                    group: { id: 'workspace', label: 'Workspace', order: 100 },
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise'],
                    featureState: 'DISABLED' },
                { id: 'documentation', label: 'Nodics Documentation', route: '/docs', icon: 'content',
                    order: 100, group: { id: 'documentation', label: 'Documentation', order: 650 },
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise'],
                    featureState: 'ACTIVE' },
                { id: 'schema-workbench', label: 'Schema Workbench', route: '/schema-workbench', icon: 'schema',
                    order: 100, group: { id: 'administration', label: 'Administration', order: 700 },
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise'],
                    featureState: 'ACTIVE', requiredPermissions: ['system.schema.workbench.view'] },
                { id: 'registry', label: 'Module Registry', route: '/registry', icon: 'registry',
                    order: 100, group: { id: 'operations', label: 'Operations and Integration', order: 600 },
                    perspectives: ['operations'], contexts: ['environment', 'tenant'],
                    featureState: 'ACTIVE', requiredPermissions: ['backoffice.registry.view'] },
                ...['Module Health', 'Integrations', 'Imports and Exports', 'Events', 'Audit Trail',
                    'Operational Failures'].map((label, index) => ({
                    id: ['module-health', 'integrations', 'imports-exports', 'events', 'audit-trail',
                        'operational-failures'][index],
                    label,
                    route: '/operations/' + ['module-health', 'integrations', 'imports-exports', 'events',
                        'audit-trail', 'operational-failures'][index],
                    icon: index === 0 ? 'registry' : 'module',
                    order: 110 + index * 10,
                    group: { id: 'operations', label: 'Operations and Integration', order: 600 },
                    perspectives: ['operations'],
                    contexts: ['environment', 'tenant'],
                    featureState: 'DISABLED'
                })),
                ...['Axis Configuration', 'Module Configuration', 'Localization', 'Units',
                    'Security Policies', 'Themes and Branding', 'System Information'].map((label, index) => ({
                    id: ['axis-configuration', 'module-configuration', 'localization', 'units',
                        'security-policies', 'themes-branding', 'system-information'][index],
                    label,
                    route: '/administration/' + ['axis-configuration', 'module-configuration',
                        'localization', 'units', 'security-policies', 'themes-branding',
                        'system-information'][index],
                    icon: 'settings',
                    order: 110 + index * 10,
                    group: { id: 'administration', label: 'Administration', order: 700 },
                    perspectives: ['operations'],
                    contexts: ['environment', 'tenant'],
                    featureState: 'DISABLED'
                }))
            ]
        }
    },
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
        publicBootstrap: {
            enabled: true,
            contractVersion: 1,
            requiredModules: {
                profile: 'profile',
                cms: 'cms'
            },
            uiComposition: {
                site: 'axisCmsSite',
                catalog: 'axisContentCatalog',
                defaultPublicPage: '/login',
                defaultAuthenticatedPage: '/dashboard',
                locale: 'en',
                channel: 'web',
                fallbackMode: 'STATIC_RECOVERY_SHELL'
            }
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
            failureRetryIntervalMs: 5000,
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
            publisherService: undefined,
            requireAcknowledgement: false
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
        operations: {
            requireDistributedStore: false,
            minimumSamples: 10,
            production: {
                enabled: false,
                requireHttpsOnly: true,
                requireHostAllowlists: true,
                requireStrictAudit: true,
                requireStrictAlerts: true
            },
            alerts: {
                enabled: false,
                failClosed: false,
                requireAcknowledgement: false,
                publisherService: undefined
            },
            thresholds: {
                availabilityFailurePercent: 25,
                availabilityQueuePercent: 80,
                discoveryFailurePercent: 25,
                storeErrors: 1,
                conditionalDeleteConflicts: 10,
                refreshThrottles: 1
            }
        },
        allowedSchemes: ['http', 'https'],
        clientSafeMetadata: ['moduleName', 'instanceId', 'environment', 'server', 'node', 'version', 'moduleKind',
            'capabilities', 'clientCallable', 'endpoint', 'healthPath', 'state', 'lastSeenAt', 'backoffice']
    }
};
