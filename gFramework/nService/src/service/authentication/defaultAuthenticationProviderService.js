/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module service/authentication/DefaultAuthenticationProviderService
 * @description Stores and retrieves authentication tokens in the Nodics cache
 * layer. Tokens are scoped by module and the `auth` cache channel so generated
 * and custom authentication providers share the same runtime contract.
 * @layer service
 * @owner nService
 * @override Project modules may override token storage to integrate Redis,
 * external IAM, opaque token stores, or custom expiration policies while
 * preserving `addToken` and `findToken` behavior.
 *
 * @property {Object} SERVICE.DefaultCacheService Cache abstraction used for auth token storage.
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
     * Adds an auth token to the module auth cache.
     *
     * @param {string} moduleName Module owning the auth token namespace.
     * @param {boolean} isExpirable Whether the token should use configured cache TTL.
     * @param {string} hash Cache key or token hash.
     * @param {Object} value Token payload.
     * @returns {Promise<Object>} Cache put response.
     */
    addToken: function (moduleName, isExpirable, hash, value, ttl) {
        return new Promise((resolve, reject) => {
            try {
                let options = {
                    moduleName: moduleName,
                    channelName: 'auth',
                    key: hash,
                    value: value
                };
                if (!isExpirable) {
                    options.ttl = 0;
                } else if (ttl) {
                    options.ttl = ttl;
                }
                SERVICE.DefaultCacheService.put(options).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(new CLASSES.NodicsError(error, null, 'ERR_AUTH_00000'));
            }
        });
    },

    /**
     * Finds an auth token in the module auth cache.
     *
     * @param {string} moduleName Module owning the auth token namespace.
     * @param {string} token Token cache key.
     * @returns {Promise<Object>} Cached token payload.
     */
    findToken: function (moduleName, token) {
        return new Promise((resolve, reject) => {
            try {
                SERVICE.DefaultCacheService.get({
                    moduleName: moduleName,
                    channelName: 'auth',
                    key: token
                }).then(value => {
                    resolve(value);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(new CLASSES.NodicsError(error, null, 'ERR_AUTH_00000'));
            }
        });
    },

    /** Atomically consumes a single-use token or session from the auth cache. */
    consumeToken: function (moduleName, token) {
        return SERVICE.DefaultCacheService.consume({
            moduleName: moduleName,
            channelName: 'auth',
            key: token
        });
    },

    /** Removes a token or session from the auth cache namespace. */
    removeToken: function (moduleName, token) {
        return SERVICE.DefaultCacheService.flushCache({
            moduleName: moduleName,
            channelName: 'auth',
            keys: [token]
        });
    },

    /** Checks whether an access-token identifier has been revoked. */
    isTokenRevoked: function (jti) {
        if (!jti) return Promise.resolve(true);
        return this.findToken(CONFIG.get('profileModuleName') || 'profile', 'revoked:' + jti)
            .then(() => true)
            .catch(() => false);
    },

    /** Persists a revocation marker for the remaining access-token lifetime. */
    revokeAccessToken: function (authData) {
        if (!authData || !authData.jti) return Promise.resolve(false);
        let ttl = authData.exp ? Math.max(1, authData.exp - Math.floor(Date.now() / 1000)) : undefined;
        return this.addToken(CONFIG.get('profileModuleName') || 'profile', true, 'revoked:' + authData.jti, {
            tenant: authData.tenant,
            loginId: authData.loginId,
            revokedAt: new Date().toISOString()
        }, ttl);
    }
};
