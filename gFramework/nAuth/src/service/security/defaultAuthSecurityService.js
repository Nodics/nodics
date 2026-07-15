/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const { v4: uuid } = require('uuid');

const INSECURE_SECRETS = ['nodics', 'secret', 'password', 'changeme'];

/**
 * @module gFramework/nAuth/src/service/security/defaultAuthSecurityService
 * @description Implements nAuth token security configuration, JWT option, and payload construction behavior.
 * @layer service
 * @owner nAuth
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    /**
     * Reads a configuration value from the active layered configuration object.
     *
     * @param {*} config Layered configuration facade.
     * @param {string} key Configuration key.
     * @returns {*} Configured value.
     */
    read: function (config, key) {
        return config && typeof config.get === 'function' ? config.get(key) : undefined;
    },

    /**
     * Resolves effective authentication security configuration.
     *
     * @param {*} config Layered configuration facade.
     * @returns {Object} Effective security configuration.
     */
    getSecurityConfiguration: function (config) {
        return _.merge({
            jwt: {
                minimumSecretLength: 32,
                issuer: 'nodics',
                audience: 'nodics-services',
                algorithms: ['HS256'],
                accessTokenExpiresIn: '3h',
                serviceTokenExpiresIn: '15m'
            },
            compatibility: {
                allowInsecureDevelopmentSecret: false,
                allowNonExpiringTokens: false
            }
        }, this.read(config, 'authSecurity') || {});
    },

    /**
     * Resolves and validates the JWT secret from layered configuration.
     *
     * @param {*} config Layered configuration facade.
     * @returns {string} JWT secret.
     */
    getJwtSecret: function (config) {
        const security = this.getSecurityConfiguration(config);
        const secret = security.jwt.secret || this.read(config, 'jwtSecretKey');
        const insecure = typeof secret !== 'string' ||
            secret.length < security.jwt.minimumSecretLength ||
            INSECURE_SECRETS.includes(secret.toLowerCase());
        if (insecure && security.compatibility.allowInsecureDevelopmentSecret !== true) {
            throw new Error('A strong JWT secret must be supplied through layered authSecurity.jwt.secret configuration');
        }
        return secret;
    },

    /**
     * Builds JWT signing options for human and service tokens.
     *
     * @param {*} config Layered configuration facade.
     * @param {Object} options Token request options.
     * @returns {Object} JWT signing options.
     */
    getSignOptions: function (config, options) {
        const security = this.getSecurityConfiguration(config);
        const profile = this.read(config, 'profile') || {};
        const tokenType = options.tokenType || (options.serviceId ? 'service' : 'access');
        const signOptions = _.merge({}, profile.jwtSignOptions || {}, security.jwt.signOptions || {});
        signOptions.algorithm = signOptions.algorithm || security.jwt.algorithms[0];
        signOptions.issuer = signOptions.issuer || security.jwt.issuer;
        signOptions.audience = signOptions.audience || security.jwt.audience;
        signOptions.jwtid = options.jti || uuid();
        signOptions.subject = options.subject || options.loginId || options.serviceId || tokenType;
        if (options.tokenLife) {
            signOptions.expiresIn = options.tokenLife;
        } else if (!signOptions.expiresIn) {
            signOptions.expiresIn = tokenType === 'service' ? security.jwt.serviceTokenExpiresIn : security.jwt.accessTokenExpiresIn;
        }
        if (options.lifetime === true) {
            if (security.compatibility.allowNonExpiringTokens !== true) {
                throw new Error('Non-expiring authentication tokens are disabled');
            }
            delete signOptions.expiresIn;
        }
        return signOptions;
    },

    /**
     * Builds JWT verification options from layered auth configuration.
     *
     * @param {*} config Layered configuration facade.
     * @returns {Object} JWT verification options.
     */
    getVerifyOptions: function (config) {
        const security = this.getSecurityConfiguration(config);
        const profile = this.read(config, 'profile') || {};
        const verifyOptions = _.merge({}, profile.jwtVerifyOptions || {}, security.jwt.verifyOptions || {});
        if (verifyOptions.algorithm && !verifyOptions.algorithms) {
            verifyOptions.algorithms = Array.isArray(verifyOptions.algorithm) ? verifyOptions.algorithm : [verifyOptions.algorithm];
        }
        delete verifyOptions.algorithm;
        verifyOptions.algorithms = verifyOptions.algorithms || security.jwt.algorithms;
        verifyOptions.issuer = verifyOptions.issuer || security.jwt.issuer;
        verifyOptions.audience = verifyOptions.audience || security.jwt.audience;
        return verifyOptions;
    },

    /**
     * Builds the token payload while excluding credential material.
     *
     * @param {Object} options Token request options.
     * @returns {Object} JWT payload.
     */
    buildPayload: function (options) {
        const tokenType = options.tokenType || (options.serviceId ? 'service' : 'access');
        const payload = {
            entCode: options.entCode,
            tenant: options.tenant,
            tokenType: tokenType
        };
        if (options.loginId) payload.loginId = options.loginId;
        if (options.serviceId) payload.serviceId = options.serviceId;
        if (options.principalType) payload.principalType = options.principalType;
        if (options.userGroups && options.userGroups.length > 0) payload.userGroups = options.userGroups;
        if (options.permissions && options.permissions.length > 0) payload.permissions = options.permissions;
        if (options.authVersion !== undefined) payload.authVersion = options.authVersion;
        return payload;
    }
};
