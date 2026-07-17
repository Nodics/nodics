/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gCore/profile/src/router/routers
 * @description Defines profile route registration and HTTP exposure metadata.
 * @layer router
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    profile: {
        loadDefaults: {
            getInternalAuthToken: {
                secured: true,
                accessGroups: ['userGroup'],
                permissionConfig: 'authSecurity.internalToken.routePermission',
                key: '/auth/token/:tntCode',
                method: 'GET',
                controller: 'DefaultInternalAuthenticationProviderController',
                operation: 'getInternalAuthToken',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'GET',
                    url: 'http://host:port/nodics/profile/auth/token/:tntCode',
                    body: {
                        'x-api-key': 'xxxxxx--xxxx---xxxx---xxxxx'
                    }
                }
            },
            getEnterprise: {
                secured: true,
                accessGroups: ['userGroup'],
                cache: {
                    enabled: false,
                    ttl: 20
                },
                key: '/enterprise/get',
                method: 'GET',
                controller: 'DefaultEnterpriseController',
                operation: 'getEnterprise',
                help: {
                    requestType: 'secured',
                    message: 'x-enterprise-code header is preferred; legacy entCode header is deprecated',
                    method: 'GET',
                    url: 'http://host:port/nodics/profile/enterprise/get',
                }
            },
            getTenants: {
                secured: true,
                accessGroups: ['userGroup'],
                cache: {
                    enabled: true,
                    ttl: 200
                },
                key: '/tenant/get',
                method: 'GET',
                controller: 'DefaultTenantController',
                operation: 'getTenants',
                help: {
                    requestType: 'secured',
                    method: 'GET',
                    url: 'http://host:port/nodics/profile/tenant/get',
                }
            }
        },

        authenticate: {
            authenticateEmployee: {
                secured: false,
                accessGroups: ['userGroup'],
                key: '/employee/authenticate',
                method: 'POST',
                handler: 'DefaultAuthenticationProviderController',
                operation: 'authenticateEmployee',
                help: {
                    requestType: 'pre-authentication',
                    message: 'Send loginId and password in the JSON body; x-enterprise-code is the enterprise header',
                    method: 'POST',
                    url: 'http://host:port/nodics/profile/employee/authenticate',
                }
            },
            authenticateCustomer: {
                secured: false,
                accessGroups: ['userGroup'],
                key: '/customer/authenticate',
                method: 'POST',
                handler: 'DefaultAuthenticationProviderController',
                operation: 'authenticateCustomer',
                help: {
                    requestType: 'pre-authentication',
                    message: 'Send loginId and password in the JSON body; x-enterprise-code is the enterprise header',
                    method: 'POST',
                    url: 'http://host:port/nodics/profile/customer/authenticate',
                }
            },
            refreshToken: {
                secured: false,
                accessGroups: ['userGroup'],
                key: '/token/refresh',
                method: 'POST',
                handler: 'DefaultAuthenticationProviderController',
                operation: 'refreshToken',
                help: {
                    requestType: 'public',
                    message: 'Exchange a refresh token once for a rotated token pair',
                    method: 'POST',
                    url: 'http://host:port/nodics/profile/token/refresh',
                    body: { refreshToken: '' }
                }
            },
            logout: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/token/logout',
                method: 'POST',
                handler: 'DefaultAuthenticationProviderController',
                operation: 'logout',
                help: {
                    requestType: 'secured',
                    message: 'Revoke the current access token and optional refresh token',
                    method: 'POST',
                    url: 'http://host:port/nodics/profile/token/logout',
                    body: { refreshToken: '' }
                }
            }
        },

        authorize: {
            authorizeToken: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/token/authorize',
                method: 'POST',
                handler: 'DefaultAuthorizationProviderController',
                operation: 'authorizeToken',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/profile/authorize',
                }
            }
        },
        identityMigration: {
            preview: {
                secured: true,
                accessGroups: ['runtimeConfigAdminUserGroup'],
                permission: 'identity.migration.preview',
                key: '/identity/migration/preview',
                method: 'POST',
                controller: 'DefaultIdentityGovernanceController',
                operation: 'previewMigration'
            },
            apply: {
                secured: true,
                accessGroups: ['runtimeConfigAdminUserGroup'],
                permission: 'identity.migration.apply',
                key: '/identity/migration/apply',
                method: 'POST',
                controller: 'DefaultIdentityGovernanceController',
                operation: 'applyMigration'
            },
            rollback: {
                secured: true,
                accessGroups: ['runtimeConfigAdminUserGroup'],
                permission: 'identity.migration.rollback',
                key: '/identity/migration/rollback',
                method: 'POST',
                controller: 'DefaultIdentityGovernanceController',
                operation: 'rollbackMigration'
            },
            rotateServiceKey: {
                secured: true,
                accessGroups: ['runtimeConfigAdminUserGroup'],
                permission: 'identity.credential.rotate',
                key: '/identity/credential/rotate',
                method: 'POST',
                controller: 'DefaultIdentityGovernanceController',
                operation: 'rotateServiceKey'
            }
        },
        customerExist: {
            isCustomerExist: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/customer/exist',
                method: 'POST',
                controller: 'DefaultCustomerController',
                operation: 'isCustomerExist',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/profile/customer/exist',
                    body: {
                        loginId: ''
                    }
                }
            }
        },
        customerSignUp: {
            registerCustomer: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/customer/signup',
                method: 'POST',
                controller: 'DefaultCustomerController',
                operation: 'signUp',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/profile/customer/signUp',
                    body: {
                        //complete customer profile data
                    }
                }
            }
        }
    }
};
