/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module service/authentication/DefaultInternalAuthenticationProviderService
 * @description Fetches tenant-scoped internal auth tokens from the profile
 * module when the profile module is deployed separately. This supports modular
 * deployment where non-profile nodes still need internal service credentials.
 * @layer service
 * @owner nService
 * @override Project modules may override this service to integrate external IAM,
 * service accounts, or secret managers while preserving tenant-scoped internal
 * token retrieval.
 *
 * @property {Object} CONFIG.defaultAuthDetail Bootstrap API key and enterprise code.
 * @property {Object} SERVICE.DefaultModuleService Internal module HTTP client.
 */
module.exports = {
    _refreshTimer: null,
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
     * Fetches an internal auth token for a tenant from the profile module.
     *
     * @param {string} tntCode Tenant code.
     * @returns {Promise<Object>} Internal token response.
     */
    fetchInternalAuthToken: function (tntCode) {
        let _self = this;
        return new Promise((resolve, reject) => {
            let header = {
                'x-api-key': CONFIG.get('defaultAuthDetail').apiKey,
                'x-enterprise-code': CONFIG.get('defaultAuthDetail').entCode
            };
            if (typeof NODICS !== 'undefined' && NODICS && typeof NODICS.getActiveModules === 'function') {
                header['x-nodics-runtime-instance'] = [NODICS.getSelectedEnvironmentName(), NODICS.getServerName(),
                    NODICS.getNodeName() || 'default', process.pid].join(':');
                header['x-nodics-modules'] = (NODICS.getActiveModules() || []).join(',');
            }
            let requestUrl = SERVICE.DefaultModuleService.buildRequest({
                moduleName: CONFIG.get('profileModuleName') || 'profile',
                methodName: 'GET',
                apiName: '/auth/token/' + tntCode,
                requestBody: {},
                responseType: true,
                header: header
            });
            try {
                SERVICE.DefaultModuleService.fetch(requestUrl).then(response => {
                    resolve(response.result || []);
                }).catch(error => {
                    _self.LOG.error('While connecting profile server to fetch API Key', error);
                    reject(new CLASSES.NodicsError(error, 'Could not fetch internal authentication token', 'ERR_AUTH_00001'));
                });
            } catch (error) {
                _self.LOG.error('While connecting profile server to fetch API Key', error);
                reject(new CLASSES.NodicsError(error, 'Could not fetch internal authentication token', 'ERR_AUTH_00001'));
            }
        });
    },

    /** Refreshes internal service tokens for all active tenant token slots. */
    refreshInternalAuthTokens: function () {
        let tenants = Object.keys(NODICS.getInternalAuthTokens() || {});
        if (tenants.length === 0) tenants = [CONFIG.get('defaultTenant') || 'default'];
        return Promise.all(tenants.map(tenant => this.fetchInternalAuthToken(tenant).then(result => {
            if (!result || !result.authToken) {
                throw new CLASSES.NodicsError('ERR_AUTH_00001', 'Rotated internal token is unavailable for tenant: ' + tenant);
            }
            NODICS.addInternalAuthToken(tenant, result.authToken);
            return tenant;
        })));
    },

    /** Schedules bounded internal service-token rotation. */
    scheduleInternalAuthTokenRefresh: function () {
        let authSecurity = CONFIG.get('authSecurity') || {};
        let jwt = authSecurity.jwt || {};
        let interval = jwt.serviceTokenRefreshIntervalMs || 10 * 60 * 1000;
        if (this._refreshTimer) clearInterval(this._refreshTimer);
        this._refreshTimer = setInterval(() => {
            this.refreshInternalAuthTokens().catch(error => {
                this.LOG.error('Internal authentication token rotation failed', error);
            });
        }, interval);
        if (this._refreshTimer.unref) this._refreshTimer.unref();
        return this._refreshTimer;
    }
};
