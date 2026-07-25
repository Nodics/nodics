/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gCore/profile/config/properties
 * @description Defines default profile configuration used during module startup and layering.
 * @layer config
 * @owner profile
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    schemaPolicies: {
        profile: {
            administrative: {
                accessGroups: {
                    adminGroup: 10,
                    runtimeConfigAdminUserGroup: 10,
                    serviceAccountUserGroup: 10
                }
            },
            customerOwned: {
                accessGroups: {
                    adminGroup: 10,
                    runtimeConfigAdminUserGroup: 10,
                    serviceAccountUserGroup: 10,
                    customerUserGroup: 10
                },
                ownership: {
                    enabled: true,
                    ownerProperty: 'ownerId',
                    bypassGroups: {
                        adminGroup: true,
                        runtimeConfigAdminUserGroup: true,
                        serviceAccountUserGroup: true
                    },
                    subjectGroups: {
                        customerUserGroup: true
                    },
                    principalTypes: {
                        customer: true
                    }
                }
            }
        }
    },
    backofficeCapabilities: {
        profile: {
            enabled: true, capabilityId: 'identity-profile', displayName: 'Profiles and Identity', category: 'core', icon: 'identity',
            contractVersion: 1, minimumClientContractVersion: 1,
            roles: ['AUTHENTICATION_PROVIDER', 'FUNCTIONAL_CAPABILITY_PROVIDER'],
            discovery: { openApiPath: '/nodics/system/v0/contract/openapi/internal', contractVersion: 1 },
            requiredPermissions: ['profile.backoffice.view'],
            navigation: [{ id: 'customers', label: 'Customers', route: '/profile', icon: 'profile', order: 100,
                group: { id: 'organization', label: 'Customers and Organization', order: 400 },
                perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise'],
                featureState: 'ACTIVE', requiredPermissions: ['profile.backoffice.view'] },
            ...['Customer Segments', 'Employees', 'Roles', 'Permission Groups', 'Enterprises',
                'Business Units'].map((label, index) => ({
                id: ['customer-segments', 'employees', 'roles', 'permission-groups', 'enterprises',
                    'business-units'][index],
                label,
                route: '/profile/' + ['customer-segments', 'employees', 'roles', 'permission-groups',
                    'enterprises', 'business-units'][index],
                icon: 'profile',
                order: 110 + index * 10,
                group: { id: 'organization', label: 'Customers and Organization', order: 400 },
                perspectives: ['operations'],
                contexts: ['environment', 'tenant', 'enterprise'],
                featureState: 'DISABLED'
            }))]
        }
    },
    mandatoryBootstrapServices: {
        profileIdentity: {
            enabled: true,
            order: 100,
            service: 'DefaultMandatoryIdentityBootstrapService'
        }
    },
    attemptsToLockAccount: 5,
    encryptSaltLength: 10,
    passwordLengthLimit: 25,
    forceAPIKeyGenerate: false,
    profileBrowserSession: {
        enabled: false,
        refreshCookieName: 'nodics_axis_refresh',
        csrfCookieName: 'nodics_axis_csrf',
        cookiePath: '/nodics/profile/v0/employee/browser',
        csrfCookiePath: '/',
        sameSite: 'Strict',
        secure: true,
        maximumAgeSeconds: 86400
    },

    enterpriseManagement: {
        search: {
            defaultResultCount: 25,
            maximumResultCount: 100,
            maximumPageNumber: 10000,
            maximumCodeLength: 128,
            maximumNameLength: 256,
            projectedFields: ['code', 'name', 'active', 'tenant', 'superEnterprise', 'createdAt', 'updatedAt']
        },
        create: {
            maximumCodeLength: 128,
            maximumNameLength: 256,
            projectedFields: ['code', 'name', 'active', 'tenant', 'superEnterprise', 'createdAt']
        }
    },

    profile: {
        jwtSignOptions: {
            expiresIn: "3h",
            algorithm: "HS256"   // RSASSA [ "RS256", "RS384", "RS512" ]
        },
        jwtVerifyOptions: {
            algorithms: ["HS256"]
        },
        loginIdFormat: 'default',
        loginIdFormatValidators: {
            email: 'DefaultLoginIdAsEmailValidatorService'
        }
    }
};
