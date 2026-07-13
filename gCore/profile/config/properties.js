/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

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
