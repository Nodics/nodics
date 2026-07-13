/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nAuth/service/identity/DefaultPrincipalSecurityStampService
 * @description Maintains tenant-scoped principal security stamps in the auth
 * cache. Production deployments should use a shared auth-cache engine.
 * @layer service
 * @owner nAuth
 * @override Project modules may integrate distributed IAM session-version storage while preserving fail-closed validation.
 */
module.exports = {
    /** Validates security-stamp cache safety during service startup. */
    init: function () {
        return this.validateConfiguration();
    },
    /** Completes service startup without additional state mutation. */
    postInit: function () {
        return Promise.resolve(true);
    },
    /** Returns the effective layered security-stamp policy. */
    getPolicy: function () {
        return CONFIG.get('authSecurity') && CONFIG.get('authSecurity').securityStamp || {};
    },
    /** Builds a tenant-scoped principal stamp cache key. */
    getKey: function (tenant, principalId) {
        return 'securityStamp:' + tenant + ':' + principalId;
    },
    /** Rejects strict deployments whose auth channel is disabled, local-only, or non-atomic. */
    validateConfiguration: function () {
        let policy = this.getPolicy();
        let security = CONFIG.get('authSecurity') || {};
        let refreshPolicy = security.refreshToken || {};
        let strictStamp = policy.enabled !== false && policy.failClosed !== false && policy.allowMissingStamp !== true;
        if (!strictStamp && refreshPolicy.requireDistributedCache !== true) return Promise.resolve(true);
        let cache = CONFIG.get('cache') || {};
        let channel = cache.profile && cache.profile.channels && cache.profile.channels.auth || {};
        let profileEngines = cache.profile && cache.profile.engines || {};
        let defaultEngines = cache.default && cache.default.engines || {};
        let engine = profileEngines[channel.engine] || defaultEngines[channel.engine] || {};
        if (cache.enabled === false || channel.enabled === false || engine.enabled === false ||
            !channel.engine || engine.distributed !== true || engine.atomicConsume !== true || channel.fallback === true) {
            return Promise.reject(new CLASSES.NodicsError('ERR_AUTH_00001', 'Strict authentication state requires an enabled distributed auth cache with atomic consume and local fallback disabled'));
        }
        return Promise.resolve(true);
    },
    /** Registers the current principal stamp in the auth cache. */
    register: function (tenant, principalId, authVersion) {
        if (!principalId || authVersion === undefined) return Promise.resolve(false);
        return SERVICE.DefaultAuthenticationProviderService.addToken(
            CONFIG.get('profileModuleName') || 'profile', false,
            this.getKey(tenant, principalId),
            { tenant: tenant, principalId: principalId, authVersion: authVersion }
        );
    },
    /** Compares a decoded token stamp with the current shared-cache value. */
    validate: function (payload) {
        let policy = this.getPolicy();
        if (policy.enabled === false) return Promise.resolve(true);
        let principalId = payload.loginId || payload.serviceId || payload.sub;
        if (!principalId || payload.authVersion === undefined) {
            return policy.allowMissingStamp === true ? Promise.resolve(true) : Promise.reject(new CLASSES.NodicsError('ERR_AUTH_00001', 'Token security stamp is required'));
        }
        return SERVICE.DefaultAuthenticationProviderService.findToken(
            CONFIG.get('profileModuleName') || 'profile', this.getKey(payload.tenant, principalId)
        ).then(stamp => {
            if (!stamp || String(stamp.authVersion) !== String(payload.authVersion)) throw new CLASSES.NodicsError('ERR_AUTH_00001', 'Authentication token security stamp is stale');
            return true;
        }).catch(error => {
            if (policy.failClosed === false || policy.allowMissingStamp === true) return true;
            throw error;
        });
    }
};
