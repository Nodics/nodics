/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module system/service/DefaultHealthService
 * @description Builds low-disclosure liveness and secured readiness responses
 * from Nodics runtime state without exposing secrets or raw provider settings.
 * @layer service
 * @owner system
 * @override Project modules may override this service to add database, cache,
 * search, messaging, storage, or deployment-specific readiness checks while
 * preserving sanitized response envelopes and topology gates.
 */
module.exports = {

    /**
     * Initializes the health service during entity loading.
     *
     * @param {Object} options Nodics initialization options for the active module hierarchy.
     * @returns {Promise<boolean>} Resolves when service initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes the health service after entity loading.
     *
     * @param {Object} options Nodics initialization options for the active module hierarchy.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Returns a minimal process-alive response for load balancer or orchestrator liveness probes.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Promise resolving to a low-disclosure response envelope.
     */
    getLiveness: function (request) {
        return new Promise((resolve, reject) => {
            resolve({
                code: 'SUC_SYS_HEALTH_LIVE',
                data: {
                    status: 'UP'
                }
            });
        });
    },

    /**
     * Returns a secured readiness response based on runtime state and required startup invariants.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Promise resolving to a readiness response envelope.
     */
    getReadiness: function (request) {
        return new Promise((resolve, reject) => {
            let checks = this.getReadinessChecks();
            let ready = checks.every(check => check.status === 'UP');
            resolve({
                code: ready ? 'SUC_SYS_HEALTH_READY' : 'SUC_SYS_HEALTH_NOT_READY',
                data: {
                    status: ready ? 'UP' : 'DOWN',
                    serverState: this.getRuntimeValue('getServerState'),
                    uptimeSeconds: Math.floor(process.uptime()),
                    topology: this.getTopologySummary(),
                    checks: checks
                }
            });
        });
    },

    /**
     * Builds sanitized readiness checks from Nodics runtime state.
     *
     * @returns {Array<Object>} Readiness check results.
     */
    getReadinessChecks: function () {
        return [
            this.createCheck('runtimeState', this.getRuntimeValue('getServerState') === 'started', 'Runtime state must be started'),
            this.createCheck('serverSelected', !!this.getRuntimeValue('getServerName'), 'Selected server must be resolved'),
            this.createCheck('activeModulesLoaded', this.getActiveModules().length > 0, 'Active module list must be loaded'),
            this.createCheck('activeTenantsLoaded', this.getActiveTenants().length > 0, 'At least one tenant must be active')
        ];
    },

    /**
     * Creates a normalized readiness check result.
     *
     * @param {string} name Check name.
     * @param {boolean} passed Whether the check passed.
     * @param {string} description Human-readable check purpose.
     * @returns {Object} Normalized check result.
     */
    createCheck: function (name, passed, description) {
        return {
            name: name,
            status: passed ? 'UP' : 'DOWN',
            description: description
        };
    },

    /**
     * Returns a sanitized topology summary for secured readiness responses.
     *
     * @returns {Object} Runtime topology summary without paths, URLs, credentials, or provider settings.
     */
    getTopologySummary: function () {
        return {
            environment: this.getRuntimeValue('getEnvironmentName'),
            server: this.getRuntimeValue('getServerName'),
            node: this.getRuntimeValue('getNodeName'),
            activeModuleCount: this.getActiveModules().length,
            activeTenantCount: this.getActiveTenants().length,
            nTestRunning: !!this.getRuntimeValue('isNTestRunning')
        };
    },

    /**
     * Safely calls a Nodics runtime accessor.
     *
     * @param {string} methodName Runtime accessor name.
     * @returns {*} Accessor value when available.
     */
    getRuntimeValue: function (methodName) {
        if (typeof NODICS !== 'undefined' && NODICS && typeof NODICS[methodName] === 'function') {
            return NODICS[methodName]();
        }
        return undefined;
    },

    /**
     * Returns active module names without exposing module paths or configuration.
     *
     * @returns {string[]} Active module names.
     */
    getActiveModules: function () {
        return this.getRuntimeValue('getActiveModules') || [];
    },

    /**
     * Returns active tenant names without exposing tenant configuration.
     *
     * @returns {string[]} Active tenant names.
     */
    getActiveTenants: function () {
        return this.getRuntimeValue('getActiveTenants') || [];
    }
};
