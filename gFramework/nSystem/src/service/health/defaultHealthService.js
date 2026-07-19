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
    _readinessContributors: {},
    _readinessCache: null,

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
        return this.evaluateReadiness().then(result => ({
            code: result.ready ? 'SUC_SYS_HEALTH_READY' : 'SUC_SYS_HEALTH_NOT_READY',
            data: { status: result.ready ? 'UP' : 'DOWN' }
        }));
    },

    /** Returns secured sanitized readiness details for operations diagnostics. */
    getReadinessDetails: function (request) {
        return this.evaluateReadiness().then(result => ({
            code: result.ready ? 'SUC_SYS_HEALTH_READY' : 'SUC_SYS_HEALTH_NOT_READY',
            data: {
                status: result.ready ? 'UP' : 'DOWN',
                serverState: this.getRuntimeValue('getServerState'),
                uptimeSeconds: Math.floor(process.uptime()),
                topology: this.getTopologySummary(),
                checks: result.checks
            }
        }));
    },

    /**
     * Builds sanitized readiness checks from Nodics runtime state.
     *
     * @returns {Array<Object>} Readiness check results.
     */
    getCoreReadinessChecks: function () {
        let state = this.getRuntimeValue('getServerState');
        let config = this.getReadinessConfig();
        let runtimeReady = state === 'started' || (state === 'degraded' && config.degradedIsReady === true);
        let defaultTenant = this.getConfigValue('defaultTenant') || 'default';
        return [
            this.createCheck('runtimeState', runtimeReady, 'Runtime state must permit traffic', true),
            this.createCheck('serverSelected', !!this.getRuntimeValue('getServerName'), 'Selected server must be resolved'),
            this.createCheck('activeModulesLoaded', this.getActiveModules().length > 0, 'Active module list must be loaded'),
            this.createCheck('activeTenantsLoaded', this.getActiveTenants().length > 0, 'At least one tenant must be active'),
            this.createCheck('internalAuthenticationReady', !!this.getInternalAuthToken(defaultTenant), 'Internal service identity must be initialized')
        ];
    },

    /** Registers one uniquely named provider or subsystem readiness contributor. */
    registerReadinessContributor: function (name, contributor) {
        if (!name || !contributor || typeof contributor.check !== 'function') {
            throw new Error('Readiness contributor requires a name and check function');
        }
        if (this._readinessContributors[name]) throw new Error('Readiness contributor already registered: ' + name);
        this._readinessContributors[name] = Object.assign({ required: true, order: 1000 }, contributor);
        this._readinessCache = null;
        return this._readinessContributors[name];
    },

    /** Evaluates core checks immediately and cached bounded contributors asynchronously. */
    evaluateReadiness: function () {
        let coreChecks = this.getCoreReadinessChecks();
        return this.getContributorReadinessChecks().then(contributorChecks => {
            let checks = coreChecks.concat(contributorChecks);
            return {
                ready: checks.filter(check => check.required !== false).every(check => check.status === 'UP'),
                checks: checks
            };
        });
    },

    /** Returns cached contributor checks or refreshes them within configured time bounds. */
    getContributorReadinessChecks: function () {
        let config = this.getReadinessConfig();
        let now = Date.now();
        if (this._readinessCache && now - this._readinessCache.createdAt < Number(config.cacheTtlMs || 1000)) {
            return Promise.resolve(this._readinessCache.checks);
        }
        let contributors = Object.keys(this._readinessContributors).map(name => Object.assign({ name }, this._readinessContributors[name]))
            .sort((left, right) => Number(left.order) - Number(right.order) || left.name.localeCompare(right.name));
        return Promise.all(contributors.map(contributor => this.evaluateReadinessContributor(contributor))).then(checks => {
            this._readinessCache = { createdAt: Date.now(), checks };
            return checks;
        });
    },

    /** Runs one contributor without allowing a slow dependency to stall probes. */
    evaluateReadinessContributor: function (contributor) {
        let timeoutMs = Number(contributor.timeoutMs || this.getReadinessConfig().contributorTimeoutMs || 1000);
        let timeout;
        return Promise.race([
            Promise.resolve().then(() => contributor.check()).then(result => {
                let passed = result === true || result && result.status === 'UP';
                return this.createCheck(contributor.name, passed, contributor.description || 'Runtime dependency readiness', contributor.required !== false);
            }),
            new Promise((resolve, reject) => {
                timeout = setTimeout(() => reject(new Error('Readiness contributor timed out')), timeoutMs);
            })
        ]).catch(() => this.createCheck(contributor.name, false,
            contributor.description || 'Runtime dependency readiness', contributor.required !== false)).finally(() => clearTimeout(timeout));
    },

    /**
     * Creates a normalized readiness check result.
     *
     * @param {string} name Check name.
     * @param {boolean} passed Whether the check passed.
     * @param {string} description Human-readable check purpose.
     * @returns {Object} Normalized check result.
     */
    createCheck: function (name, passed, description, required) {
        return {
            name: name,
            status: passed ? 'UP' : 'DOWN',
            description: description,
            required: required !== false
        };
    },

    /** Returns layered readiness policy without exposing it in responses. */
    getReadinessConfig: function () {
        return this.getConfigValue('readiness') || {};
    },

    /** Safely reads one effective configuration value. */
    getConfigValue: function (name) {
        if (typeof CONFIG !== 'undefined' && CONFIG && typeof CONFIG.get === 'function') return CONFIG.get(name);
        return undefined;
    },

    /** Returns the tenant-scoped internal token without exposing its value. */
    getInternalAuthToken: function (tenant) {
        if (typeof NODICS !== 'undefined' && NODICS && typeof NODICS.getInternalAuthToken === 'function') {
            return NODICS.getInternalAuthToken(tenant);
        }
        return undefined;
    },

    /** Clears registered contributors and cached results for isolated tests. */
    resetReadinessContributors: function () {
        this._readinessContributors = {};
        this._readinessCache = null;
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
