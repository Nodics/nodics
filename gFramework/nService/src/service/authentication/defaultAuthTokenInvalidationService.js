/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module service/authentication/DefaultAuthTokenInvalidationService
 * @description Cache listener callbacks for auth token expiration, deletion,
 * and flush events. The default implementation logs sanitized invalidation
 * context and keeps the extension point for distributed token invalidation
 * events.
 * @layer service
 * @owner nService
 * @override Project modules may override these callbacks to publish cluster-wide
 * invalidation events, audit auth lifecycle changes, or synchronize external
 * identity providers without logging token material or cache keys.
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

    /** Builds a sanitized invalidation context without token material or cache keys. */
    buildInvalidationContext: function (value, options, reasonCode) {
        value = value || {};
        options = options || {};
        let context = {
            eventType: 'auth.token.invalidation',
            outcome: 'success',
            reasonCode: reasonCode,
            source: options.moduleName,
            tokenType: value.tokenType || value.type,
            tenant: value.tenant || options.tenant,
            entCode: value.entCode
        };
        if (value.enterprise && value.enterprise.tenant && value.enterprise.tenant.code) context.tenant = value.enterprise.tenant.code;
        if (value.enterprise && value.enterprise.code) context.entCode = value.enterprise.code;
        context.principalId = value.loginId || value.serviceId || value.principalId;
        Object.keys(context).forEach(key => {
            if (context[key] === undefined || context[key] === null) delete context[key];
        });
        return context;
    },

    /** Records an optional sanitized auth audit event without blocking cache callbacks. */
    recordInvalidationAudit: function (context) {
        if (typeof SERVICE === 'undefined' || !SERVICE.DefaultAuthAuditService || typeof SERVICE.DefaultAuthAuditService.record !== 'function') return Promise.resolve(false);
        return Promise.resolve(SERVICE.DefaultAuthAuditService.record(context)).catch(error => {
            this.LOG.error('Authentication invalidation audit recording failed', error);
            return false;
        });
    },

    /**
     * Handles auth token expiration notifications.
     *
     * @param {string} key Cache key; intentionally not logged or audited.
     * @param {Object} value Cached token payload.
     * @param {Object} options Cache listener options.
     * @returns {undefined}
     */
    publishTokenExpiredEvent: function (key, value, options) {
        let context = this.buildInvalidationContext(value, options, 'AUTH_TOKEN_EXPIRED');
        this.LOG.debug('Auth token has been expired', context);
        this.recordInvalidationAudit(context);
    },

    /**
     * Handles auth token deletion notifications.
     *
     * @param {string} key Cache key; intentionally not logged or audited.
     * @param {Object} value Cached token payload.
     * @param {Object} options Cache listener options.
     * @returns {undefined}
     */
    publishTokenDeletedEvent: function (key, value, options) {
        let context = this.buildInvalidationContext(value, options, 'AUTH_TOKEN_DELETED');
        this.LOG.debug('Auth token has been deleted', context);
        this.recordInvalidationAudit(context);
    },

    /**
     * Handles auth token cache flush notifications.
     *
     * @param {Object} options Cache listener options.
     * @returns {undefined}
     */
    publishTokenFlushedEvent: function (options) {
        let context = this.buildInvalidationContext({}, options, 'AUTH_TOKEN_FLUSHED');
        this.LOG.debug('Auth tokens have been flushed', context);
        this.recordInvalidationAudit(context);
    }
};
