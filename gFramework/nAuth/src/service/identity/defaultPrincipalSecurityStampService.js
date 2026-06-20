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
    /** Rejects strict modular deployments that use local or fallback auth cache. */
    validateConfiguration: function () {
        let policy = this.getPolicy();
        if (policy.enabled === false || policy.failClosed === false || policy.allowMissingStamp === true) return Promise.resolve(true);
        let cache = CONFIG.get('cache') || {};
        let channel = cache.profile && cache.profile.channels && cache.profile.channels.auth || {};
        if (!channel.engine || channel.engine === 'local' || channel.fallback === true) {
            return Promise.reject(new CLASSES.NodicsError('ERR_AUTH_00001', 'Strict security-stamp validation requires a shared auth cache with local fallback disabled'));
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
        if (policy.enabled === false || payload.tokenType === 'service') return Promise.resolve(true);
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
