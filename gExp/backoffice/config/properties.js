/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
        maximumIdleTimeoutSeconds: 86400,
        recentNavigationLimit: 12,
        minimumRecentNavigationLimit: 1,
        maximumRecentNavigationLimit: 24
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
                    defaultPage: '/docs', packCode: 'nodicsDocumentation',
                    dashboard: {
                        kind: 'Framework guide', icon: 'content',
                        summary: 'Core Nodics architecture, module layering, configuration-first extension, lifecycle, and customization guidance.',
                        audiences: ['architect', 'developer', 'operator', 'ai-tool'],
                        coverage: {
                            score: 85, status: 'STRONG',
                            signals: ['Architecture model', 'Module lifecycle', 'Customization guidance', 'AI-tool standards'],
                            gaps: ['More troubleshooting recipes', 'More customer-extension examples']
                        }
                    }
                },
                {
                    id: 'swaggers', label: 'Swaggers', type: 'OPENAPI', route: '/docs/swaggers', order: 200,
                    connectionModule: 'system', openApiPath: '/nodics/system/v0/contract/openapi',
                    swaggerPath: '/nodics/system/v0/contract/swagger',
                    dashboard: {
                        kind: 'API contracts', icon: 'reference',
                        summary: 'Generated OpenAPI and Swagger contracts for authorized backend modules and runtime APIs.',
                        audiences: ['developer', 'operator', 'integration'],
                        coverage: {
                            score: 100, status: 'REFERENCE',
                            signals: ['Generated from backend contracts', 'Module API discovery', 'Swagger UI access'],
                            gaps: ['Narrative examples belong in framework capability docs']
                        }
                    }
                },
                {
                    id: 'nodics-axis', label: 'Nodics Axis', type: 'CMS', route: '/docs/nodics-axis', order: 300,
                    connectionModule: 'cms', site: 'axisDocumentationSite', catalog: 'axisDocumentationContentCatalog',
                    defaultPage: '/docs/nodics-axis', packCode: 'axisDocumentation',
                    dashboard: {
                        kind: 'Application guide', icon: 'schema',
                        summary: 'Short user-facing guidance for the Nodics Axis BackOffice client, shell, workbench, and business workspaces.',
                        audiences: ['administrator', 'business-user', 'operator'],
                        coverage: {
                            score: 45, status: 'PARTIAL',
                            signals: ['Application shell guidance', 'Schema Workbench entry points', 'Media Management flow notes'],
                            gaps: ['More end-to-end user journeys', 'More page-level operator help', 'More role-specific recipes']
                        }
                    }
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
                { id: 'documentation-framework', parentId: 'documentation', label: 'Framework',
                    route: '/docs/framework', icon: 'content', order: 110,
                    group: { id: 'documentation', label: 'Documentation', order: 650 },
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise'],
                    featureState: 'ACTIVE' },
                { id: 'documentation-swaggers', parentId: 'documentation', label: 'Swaggers',
                    route: '/docs/swaggers', icon: 'reference', order: 120,
                    group: { id: 'documentation', label: 'Documentation', order: 650 },
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise'],
                    featureState: 'ACTIVE' },
                { id: 'documentation-nodics-axis', parentId: 'documentation', label: 'Nodics Axis',
                    route: '/docs/nodics-axis', icon: 'content', order: 130,
                    group: { id: 'documentation', label: 'Documentation', order: 650 },
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise'],
                    featureState: 'ACTIVE' },
                { id: 'schema-workbench', label: 'Schema Workbench', route: '/schema-workbench', icon: 'schema',
                    order: 100, group: { id: 'administration', label: 'Administration', order: 700 },
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise'],
                    help: { summary: 'Discover authorized backend schemas, query records, and use allowed operations without making Axis a schema or API authority.', documentationRoute: '/docs/solutions/backoffice/schema-workbench', documentationFragment: 'what-this-screen-does' },
                    featureState: 'ACTIVE', requiredPermissions: ['system.schema.workbench.view'] },
                { id: 'registry', label: 'Module Registry', route: '/registry', icon: 'registry',
                    order: 100, group: { id: 'operations', label: 'Operations and Integration', order: 600 },
                    perspectives: ['operations'], contexts: ['environment', 'tenant'],
                    help: { summary: 'Review registered BackOffice capabilities and module catalogue data contributed by owning modules.', documentationRoute: '/docs/reference/backoffice', documentationFragment: 'capability-discovery' },
                    featureState: 'ACTIVE', requiredPermissions: ['backoffice.registry.view'] },
                { id: 'module-health', label: 'Module Health', route: '/operations/module-health', icon: 'health',
                    order: 110, group: { id: 'operations', label: 'Operations and Integration', order: 600 },
                    perspectives: ['operations'], contexts: ['environment', 'tenant'],
                    help: { summary: 'Inspect module registrations, availability, readiness, and refresh behavior from the BackOffice registry without replacing module-owned health authority.', documentationRoute: '/docs/reference/backoffice', documentationFragment: 'module-health-operations' },
                    featureState: 'ACTIVE', requiredPermissions: ['backoffice.registry.admin.view'] },
                { id: 'imports-exports', label: 'Imports and Exports', route: '/operations/imports-exports', icon: 'import',
                    order: 120, group: { id: 'operations', label: 'Operations and Integration', order: 600 },
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise'],
                    help: { summary: 'Review governed import and export flows, source files, run history, validation, and outbound data contracts owned by nImport and nExport.', documentationRoute: '/docs/capabilities/data-exchange', documentationFragment: 'import-and-export' },
                    featureState: 'ACTIVE', requiredPermissions: ['import.core.run'] },
                { id: 'integrations', label: 'Integrations', route: '/operations/integrations', icon: 'module',
                    order: 130, group: { id: 'operations', label: 'Operations and Integration', order: 600 },
                    perspectives: ['operations'], contexts: ['environment', 'tenant'],
                    featureState: 'DISABLED' },
                { id: 'events', label: 'Events', route: '/operations/events', icon: 'module',
                    order: 140, group: { id: 'operations', label: 'Operations and Integration', order: 600 },
                    perspectives: ['operations'], contexts: ['environment', 'tenant'],
                    featureState: 'DISABLED' },
                { id: 'audit-trail', label: 'Audit Trail', route: '/operations/audit-trail', icon: 'module',
                    order: 150, group: { id: 'operations', label: 'Operations and Integration', order: 600 },
                    perspectives: ['operations'], contexts: ['environment', 'tenant'],
                    featureState: 'DISABLED' },
                { id: 'operational-failures', label: 'Operational Failures', route: '/operations/operational-failures', icon: 'module',
                    order: 160, group: { id: 'operations', label: 'Operations and Integration', order: 600 },
                    perspectives: ['operations'], contexts: ['environment', 'tenant'],
                    featureState: 'DISABLED' },
                { id: 'axis-configuration', label: 'Axis Configuration', route: '/administration/axis-configuration', icon: 'settings',
                    order: 110, group: { id: 'administration', label: 'Administration', order: 700 },
                    perspectives: ['operations'], contexts: ['environment', 'tenant'],
                    featureState: 'DISABLED' },
                { id: 'module-configuration', label: 'Module Configuration', route: '/administration/module-configuration', icon: 'settings',
                    order: 120, group: { id: 'administration', label: 'Administration', order: 700 },
                    perspectives: ['operations'], contexts: ['environment', 'tenant'],
                    featureState: 'DISABLED' },
                { id: 'localization', label: 'Localization', route: '/administration/localization', icon: 'settings',
                    order: 130, group: { id: 'administration', label: 'Administration', order: 700 },
                    perspectives: ['operations'], contexts: ['environment', 'tenant'],
                    featureState: 'DISABLED' },
                { id: 'units', label: 'Units', route: '/administration/units', icon: 'settings',
                    order: 140, group: { id: 'administration', label: 'Administration', order: 700 },
                    perspectives: ['operations'], contexts: ['environment', 'tenant'],
                    featureState: 'DISABLED' },
                { id: 'security-policies', label: 'Security Policies', route: '/administration/security-policies', icon: 'settings',
                    order: 150, group: { id: 'administration', label: 'Administration', order: 700 },
                    perspectives: ['operations'], contexts: ['environment', 'tenant'],
                    featureState: 'DISABLED' },
                { id: 'themes-branding', label: 'Themes and Branding', route: '/administration/themes-branding', icon: 'settings',
                    order: 160, group: { id: 'administration', label: 'Administration', order: 700 },
                    perspectives: ['operations'], contexts: ['environment', 'tenant'],
                    featureState: 'DISABLED' },
                { id: 'system-information', label: 'System Information', route: '/administration/system-information', icon: 'settings',
                    order: 170, group: { id: 'administration', label: 'Administration', order: 700 },
                    perspectives: ['operations'], contexts: ['environment', 'tenant'],
                    featureState: 'DISABLED' }
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
            preferredModule: null
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
            publisherService: null,
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
                publisherService: null
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
        clientSafeMetadata: ['moduleName', 'displayName', 'parentModule', 'canonicalIdentity', 'instanceId',
            'environment', 'server', 'node', 'version', 'moduleKind',
            'capabilities', 'clientCallable', 'endpoint', 'healthPath', 'state', 'lastSeenAt', 'backoffice']
    }
};
