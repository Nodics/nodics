/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nAuth/config/Properties
 * @description Defines layered authentication security, identity governance, permission catalog, migration, and auth-cache defaults.
 * @layer config
 * @owner nAuth
 * @override Project, environment, server, and node modules may merge stricter identity policies and additional governed permissions without weakening framework security contracts.
 */
/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    authSecurity: {
        jwt: {
            secret: process.env.NODICS_JWT_SECRET,
            minimumSecretLength: 32,
            issuer: process.env.NODICS_JWT_ISSUER || 'nodics',
            audience: process.env.NODICS_JWT_AUDIENCE || 'nodics-services',
            algorithms: ['HS256'],
            requireJti: true,
            accessTokenExpiresIn: '3h',
            serviceTokenExpiresIn: '15m',
            serviceTokenRefreshIntervalMs: 10 * 60 * 1000
        },
        refreshToken: {
            expiresInSeconds: 60 * 60 * 24 * 30,
            rotateOnUse: true,
            requireDistributedCache: true
        },
        apiKey: {
            defaultLifetimeSeconds: 60 * 60 * 24 * 90,
            requireScopes: true,
            allowLegacyHumanPrincipals: false,
            allowLegacyPlaintextLookup: false,
            pepper: process.env.NODICS_API_KEY_PEPPER,
            minimumPepperLength: 32
        },
        audit: {
            enabled: true,
            publisherService: undefined,
            failClosed: false
        },
        securityStamp: {
            enabled: true,
            failClosed: true,
            allowMissingStamp: false
        },
        internalToken: {
            routePermission: 'auth.internal.token.read',
            crossTenantPermissions: ['auth.internal.token.read.anyTenant'],
            crossTenantGroups: []
        },
        compatibility: {
            allowInsecureDevelopmentSecret: false,
            allowNonExpiringTokens: false,
            allowPasswordHeaders: false
        }
    },
    cache: {
        profile: {
            channels: {
                auth: {
                    ttl: 60 * 60,
                    enabled: true,
                    fallback: true,
                    engine: process.env.NODICS_AUTH_CACHE_ENGINE || 'local',
                    events: {
                        expired: 'DefaultAuthTokenInvalidationService.publishTokenExpiredEvent',
                        del: 'DefaultAuthTokenInvalidationService.publishTokenDeletedEvent',
                        flushed: 'DefaultAuthTokenInvalidationService.publishTokenFlushedEvent'
                    }
                }
            }
        }
    },
    identityGovernance: {
        administrativeGroups: ['adminGroup', 'runtimeConfigAdminUserGroup', 'serviceAccountUserGroup'],
        systemAccessGroups: ['serviceAccountUserGroup'],
        groupValidationPageSize: 10000,
        customerRegistration: {
            group: 'customerUserGroup',
            active: true
        },
        permissionCatalog: [
            'identity.migration.preview',
            'identity.migration.apply',
            'identity.migration.rollback',
            'identity.credential.rotate',
            'auth.internal.token.read',
            'auth.internal.token.read.anyTenant',
            'runtime.config.history.view',
            'runtime.config.summary.view',
            'runtime.config.request.view',
            'runtime.config.preview',
            'runtime.config.request.create',
            'runtime.config.request.approve',
            'runtime.config.request.reject',
            'runtime.config.request.activate',
            'runtime.config.rollback',
            'runtime.config.cleanup.preview',
            'runtime.config.cleanup.execute',
            'cache.flush',
            'cache.configuration.router.update',
            'cache.configuration.item.update',
            'system.contract.openapi.view',
            'system.file.read',
            'system.file.download',
            'system.log.level.update',
            'system.schema.index.rebuild',
            'system.schema.validator.rebuild',
            'system.test.unit.run',
            'system.test.nodics.run',
            'import.init.run',
            'import.core.run',
            'import.sample.run',
            'import.local.run',
            'export.run',
            'dynamo.class.view',
            'dynamo.class.snapshot.view',
            'dynamo.class.update',
            'dynamo.class.execute'
        ],
        migration: {
            version: 1,
            reconcileMissingGroupsOnStartup: true,
            servicePrincipalCodes: ['apiAdmin'],
            servicePrincipalScopes: {
                apiAdmin: ['auth.internal.token.read', 'auth.internal.token.read.anyTenant']
            },
            administratorCodes: ['admin'],
            serviceGroup: 'serviceAccountUserGroup',
            administratorGroups: ['adminGroup', 'runtimeConfigAdminUserGroup'],
            humanDefaultGroup: 'employeeUserGroup',
            customerGroup: 'customerUserGroup',
            groupTargets: {
                userGroup: { parentGroups: [] },
                adminGroup: { parentGroups: ['userGroup'] },
                runtimeConfigViewerUserGroup: {
                    parentGroups: ['employeeUserGroup'],
                    permissions: [
                        'runtime.config.history.view',
                        'runtime.config.summary.view',
                        'runtime.config.request.view',
                        'system.contract.openapi.view'
                    ]
                },
                runtimeConfigRequesterUserGroup: {
                    parentGroups: ['runtimeConfigViewerUserGroup'],
                    permissions: ['runtime.config.preview', 'runtime.config.request.create']
                },
                runtimeConfigApproverUserGroup: {
                    parentGroups: ['runtimeConfigViewerUserGroup'],
                    permissions: ['runtime.config.request.approve', 'runtime.config.request.reject']
                },
                runtimeConfigOperatorUserGroup: {
                    parentGroups: ['runtimeConfigRequesterUserGroup'],
                    permissions: [
                        'runtime.config.request.activate',
                        'runtime.config.rollback',
                        'runtime.config.cleanup.preview'
                    ]
                },
                runtimeConfigAdminUserGroup: {
                    parentGroups: ['runtimeConfigOperatorUserGroup', 'runtimeConfigApproverUserGroup'],
                    permissions: [
                        'runtime.config.cleanup.execute',
                        'identity.migration.preview',
                        'identity.migration.apply',
                        'identity.migration.rollback',
                        'identity.credential.rotate',
                        'cache.flush',
                        'cache.configuration.router.update',
                        'cache.configuration.item.update',
                        'system.file.read',
                        'system.file.download',
                        'system.log.level.update',
                        'system.schema.index.rebuild',
                        'system.schema.validator.rebuild',
                        'system.test.unit.run',
                        'system.test.nodics.run',
                        'import.init.run',
                        'import.core.run',
                        'import.sample.run',
                        'import.local.run',
                        'export.run',
                        'dynamo.class.view',
                        'dynamo.class.snapshot.view',
                        'dynamo.class.update',
                        'dynamo.class.execute'
                    ]
                },
                serviceAccountUserGroup: {
                    parentGroups: ['userGroup'],
                    permissions: ['auth.internal.token.read', 'auth.internal.token.read.anyTenant']
                }
            }
        },
        separationOfDuties: {
            requireActor: true,
            preventSelfDecision: true,
            preventRequesterActivation: true,
            preventApproverActivation: true
        }
    }
};
