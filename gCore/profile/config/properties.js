/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
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
            algorithm: ["HS256"]
        },
        loginIdFormat: 'default',
        loginIdFormatValidators: {
            email: 'DefaultLoginIdAsEmailValidatorService'
        }
    },

    cache: {
        profile: {
            channels: {
                auth: {
                    ttl: 60 * 60,
                    enabled: true,
                    fallback: true,
                    engine: 'local',
                    events: {
                        expired: 'DefaultAuthTokenInvalidationService.publishTokenExpiredEvent',
                        del: 'DefaultAuthTokenInvalidationService.publishTokenDeletedEvent',
                        flushed: 'DefaultAuthTokenInvalidationService.publishTokenFlushedEvent'
                    }
                },
            }
        }
    }
};