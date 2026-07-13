/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const jwt = require('jsonwebtoken');
const authSecurity = require('../../../../nAuth/src/utils/authSecurity');

/**
 * @module service/authorization/DefaultAuthorizationProviderService
 * @description Authorizes bearer tokens and API keys for Nodics requests. JWT
 * token verification resolves request identity, while API key authorization
 * delegates to the authentication provider extension point.
 * @layer service
 * @owner nService
 * @override Project modules may override this service to integrate OAuth2,
 * OpenID Connect, SAML, API gateways, or enterprise IAM while preserving the
 * `authorizeToken` and `authorizeAPIKey` request contracts.
 *
 * @property {string} CONFIG.jwtSecretKey JWT signing secret.
 * @property {Object} CONFIG.profile.jwtVerifyOptions JWT verification options.
 */
module.exports = {
    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Verifies a JWT auth token and returns decoded identity payload.
     *
     * @param {Object} request Authorization request.
     * @param {string} request.authToken JWT token.
     * @returns {Promise<Object>} Authorization success response with decoded payload.
     */
    authorizeToken: function (request) {
        return new Promise((resolve, reject) => {
            let jwtVerifyOptions;
            let jwtSecret;
            try {
                jwtVerifyOptions = authSecurity.getVerifyOptions(CONFIG);
                jwtSecret = authSecurity.getJwtSecret(CONFIG);
            } catch (error) {
                reject(new CLASSES.NodicsError(error, null, 'ERR_AUTH_00001'));
                return;
            }
            jwt.verify(request.authToken, jwtSecret, jwtVerifyOptions, (error, payload) => {
                if (error) {
                    reject(new CLASSES.NodicsError(error, null, 'ERR_AUTH_00001'));
                } else {
                    let security = authSecurity.getSecurityConfiguration(CONFIG);
                    if (security.jwt.requireJti !== false && !payload.jti) {
                        reject(new CLASSES.NodicsError('ERR_AUTH_00001', 'Token identifier is required'));
                        return;
                    }
                    SERVICE.DefaultAuthenticationProviderService.isTokenRevoked(payload.jti).then(revoked => {
                        if (revoked) {
                            reject(new CLASSES.NodicsError('ERR_AUTH_00001', 'Authentication token has been revoked'));
                        } else {
                            SERVICE.DefaultPrincipalSecurityStampService.validate(payload).then(() => {
                                resolve({ code: 'SUC_SYS_00000', result: payload });
                            }).catch(reject);
                        }
                    }).catch(reject);
                }
            });
        });
    },

    /**
     * Authorizes an API key request through the authentication provider.
     *
     * @param {Object} request Authorization request.
     * @returns {Promise<Object>} API key authorization response.
     */
    authorizeAPIKey: function (request) {
        return new Promise((resolve, reject) => {
            SERVICE.DefaultAuthenticationProviderService.authenticateAPIKey(request).then(success => {
                resolve(success);
            }).catch(error => {
                reject(error);
            });
        });
    }
};
