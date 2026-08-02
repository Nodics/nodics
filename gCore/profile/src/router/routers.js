/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
            },
            searchEnterprises: {
                secured: true,
                authTokenTypes: ['access'],
                accessGroups: ['runtimeConfigAdminUserGroup'],
                permission: 'profile.enterprise.search',
                apiExposure: 'profileManagement',
                key: '/enterprises/search',
                method: 'GET',
                controller: 'DefaultEnterpriseManagementController',
                operation: 'search',
                summary: 'Search enterprises through a bounded administrative projection',
                description: 'Returns a bounded, client-safe enterprise list. Profile remains the identity and persistence authority.',
                parameters: [
                    { name: 'code', in: 'query', required: false, schema: { type: 'string', maxLength: 128 } },
                    { name: 'name', in: 'query', required: false, schema: { type: 'string', maxLength: 256 } },
                    { name: 'active', in: 'query', required: false, schema: { type: 'boolean' } },
                    { name: 'page', in: 'query', required: false, schema: { type: 'integer', minimum: 1 } },
                    { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 100 } }
                ],
                responses: {
                    '200': { description: 'Bounded enterprise search result' }
                }
            },
            createEnterprise: {
                secured: true, authTokenTypes: ['access'],
                accessGroups: ['runtimeConfigAdminUserGroup'],
                permission: 'profile.enterprise.create', apiExposure: 'profileManagement',
                key: '/enterprises', method: 'POST',
                controller: 'DefaultEnterpriseManagementController', operation: 'create',
                summary: 'Create one enterprise after governed confirmation',
                description: 'Profile validates and persists the enterprise; callers may not bypass target authorization.',
                requestBody: { required: true, content: { 'application/json': { schema: {
                    type: 'object', additionalProperties: false, required: ['code', 'name', 'idempotencyKey'],
                    properties: {
                        code: { type: 'string', maxLength: 128 }, name: { type: 'string', maxLength: 256 },
                        tenantCode: { type: 'string', maxLength: 128 },
                        superEnterpriseCode: { type: 'string', maxLength: 128 },
                        active: { type: 'boolean' }, idempotencyKey: { type: 'string', minLength: 8, maxLength: 256 }
                    }
                } } } },
                responses: { '200': { description: 'Created client-safe enterprise result' } }
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
                    parameters: [
                        {
                            name: 'x-enterprise-code',
                            in: 'header',
                            required: false,
                            description: 'Enterprise code used to resolve the login tenant. Legacy entCode header is deprecated.',
                            schema: {
                                type: 'string'
                            }
                        }
                    ],
                    body: {
                        loginId: 'Employee login id',
                        password: 'Employee password'
                    }
                }
            },
            authenticateEmployeeBrowser: {
                secured: false,
                accessGroups: ['userGroup'],
                key: '/employee/browser/authenticate',
                method: 'POST',
                handler: 'DefaultAuthenticationProviderController',
                operation: 'authenticateEmployeeBrowser',
                help: {
                    requestType: 'pre-authentication',
                    message: 'Authenticate an employee and establish a secure browser refresh session',
                    method: 'POST',
                    url: 'http://host:port/nodics/profile/employee/browser/authenticate'
                }
            },
            restoreEmployeeBrowser: {
                secured: false,
                accessGroups: ['userGroup'],
                key: '/employee/browser/restore',
                method: 'POST',
                handler: 'DefaultAuthenticationProviderController',
                operation: 'restoreEmployeeBrowser',
                help: {
                    requestType: 'browser-session',
                    message: 'Rotate the HttpOnly browser refresh session after CSRF validation',
                    method: 'POST',
                    url: 'http://host:port/nodics/profile/employee/browser/restore'
                }
            },
            logoutEmployeeBrowser: {
                secured: false,
                accessGroups: ['userGroup'],
                key: '/employee/browser/logout',
                method: 'POST',
                handler: 'DefaultAuthenticationProviderController',
                operation: 'logoutEmployeeBrowser',
                help: {
                    requestType: 'browser-session',
                    message: 'Revoke and clear the browser refresh session after CSRF validation',
                    method: 'POST',
                    url: 'http://host:port/nodics/profile/employee/browser/logout'
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
                    parameters: [
                        {
                            name: 'x-enterprise-code',
                            in: 'header',
                            required: false,
                            description: 'Enterprise code used to resolve the login tenant. Legacy entCode header is deprecated.',
                            schema: {
                                type: 'string'
                            }
                        }
                    ],
                    body: {
                        loginId: 'Customer login id',
                        password: 'Customer password'
                    }
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
