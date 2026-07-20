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
    backofficeCapabilities: {
        profile: {
            enabled: true, capabilityId: 'identity-profile', displayName: 'Profiles and Identity', category: 'core', icon: 'identity',
            contractVersion: 1, minimumClientContractVersion: 1,
            roles: ['AUTHENTICATION_PROVIDER', 'FUNCTIONAL_CAPABILITY_PROVIDER'],
            discovery: { openApiPath: '/nodics/system/v0/contract/openapi/internal', contractVersion: 1 },
            requiredPermissions: ['profile.backoffice.view'],
            navigation: [{ id: 'profile', label: 'Profiles', route: '/profile', order: 100, requiredPermissions: ['profile.backoffice.view'] }]
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
