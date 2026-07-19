/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nService/service/module/DefaultModuleRegistrationAgentService
 * @description Registers locally served modules with BackOffice asynchronously after traffic startup and renews their observed leases.
 * @layer service
 * @owner nService
 * @override Projects may replace identity, capability, or registration policy while preserving non-blocking startup and service-token boundaries.
 */
module.exports = {
    _timer: null,
    _running: false,
    _registered: [],
    _metrics: { attempts: 0, successes: 0, failures: 0, deregistrations: 0, lastSuccessAt: null, lastFailureAt: null },

    /** Registers this agent with the central runtime lifecycle. */
    init: function () {
        if (SERVICE.DefaultRuntimeLifecycleService) {
            SERVICE.DefaultRuntimeLifecycleService.registerContributor('moduleRegistrationAgent', {
                order: 700,
                ready: () => { this.start(); return true; },
                drain: () => this.stop(true),
                shutdown: () => this.stop(false)
            });
        }
        return Promise.resolve(true);
    },

    /** Completes the standard service post-initialization contract. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns effective registration and heartbeat policy. */
    getConfiguration: function () { return CONFIG.get('backofficeRegistration') || {}; },

    /** Starts asynchronous registration and lease renewal without blocking readiness. */
    start: function () {
        let config = this.getConfiguration();
        if (config.enabled === false || this._timer) return false;
        this.runRegistration().catch(() => {});
        this._timer = setInterval(() => this.runRegistration().catch(() => {}), Number(config.heartbeatIntervalMs || 10000));
        if (this._timer.unref) this._timer.unref();
        return true;
    },

    /** Returns active modules whose routers are served by this process. */
    getLocalModules: function () {
        return (NODICS.getActiveModules() || []).filter(moduleName => {
            let moduleObject = NODICS.getRawModule(moduleName);
            return moduleObject && moduleObject.metaData && moduleObject.metaData.nodics &&
                moduleObject.metaData.nodics.runtime && moduleObject.metaData.nodics.runtime.router === true;
        });
    },

    /** Builds a process-unique instance identity from selected runtime coordinates. */
    getInstanceId: function () {
        return [NODICS.getEnvironmentName(), NODICS.getServerName(), NODICS.getNodeName() || 'default', process.pid].join(':');
    },

    /** Builds a bounded module registration payload from authoritative runtime metadata. */
    buildRegistration: function (moduleName) {
        let rawModule = NODICS.getRawModule(moduleName) || {};
        let metadata = rawModule.metaData || {};
        let config = this.getConfiguration();
        return {
            moduleName: moduleName,
            instanceId: this.getInstanceId(),
            version: metadata.version || 'unknown',
            capabilities: (metadata.nodics && metadata.nodics.owns || []).slice(),
            endpoint: SERVICE.DefaultRouterService.prepareUrl({ moduleName: moduleName }),
            healthPath: config.healthPath,
            leaseTtlMs: config.leaseTtlMs
        };
    },

    /** Resolves the tenant-scoped internal service authorization header. */
    getAuthorizationHeader: function () {
        let tenant = CONFIG.get('defaultTenant') || 'default';
        let token = NODICS.getInternalAuthToken(tenant);
        return token ? { Authorization: 'Bearer ' + token } : null;
    },

    /** Registers or renews all locally served module leases in one bounded cycle. */
    runRegistration: async function () {
        if (this._running) return false;
        this._running = true;
        this._metrics.attempts++;
        try {
            let header = this.getAuthorizationHeader();
            if (!header) throw new Error('Internal service token is not available');
            let config = this.getConfiguration();
            let modules = this.getLocalModules();
            await Promise.all(modules.map(moduleName => SERVICE.DefaultModuleService.fetch(SERVICE.DefaultModuleService.buildRequest({
                moduleName: config.moduleName || 'backoffice',
                apiName: '/registry/instances',
                methodName: 'PUT',
                header: Object.assign({ 'Idempotency-Key': this.getInstanceId() + ':' + moduleName }, header),
                requestBody: this.buildRegistration(moduleName),
                timeoutMs: config.requestTimeoutMs
            }))));
            this._registered = modules;
            this._metrics.successes++;
            this._metrics.lastSuccessAt = new Date().toISOString();
            return true;
        } catch (error) {
            this._metrics.failures++;
            this._metrics.lastFailureAt = new Date().toISOString();
            this.LOG.warn('BackOffice registration is unavailable; runtime traffic remains enabled', {
                server: NODICS.getServerName(), code: error.code || 'REGISTRATION_FAILED'
            });
            return false;
        } finally {
            this._running = false;
        }
    },

    /** Attempts idempotent removal of locally registered leases during drain. */
    deregister: async function () {
        let header = this.getAuthorizationHeader();
        if (!header || this._registered.length === 0) return false;
        let config = this.getConfiguration();
        try {
            await Promise.all(this._registered.map(moduleName => SERVICE.DefaultModuleService.fetch(SERVICE.DefaultModuleService.buildRequest({
                moduleName: config.moduleName || 'backoffice',
                apiName: '/registry/instances/' + encodeURIComponent(this.getInstanceId()),
                methodName: 'DELETE',
                header: Object.assign({ 'Idempotency-Key': this.getInstanceId() + ':' + moduleName + ':delete' }, header),
                requestBody: { moduleName: moduleName },
                timeoutMs: config.requestTimeoutMs
            }))));
            this._metrics.deregistrations++;
            return true;
        } catch (error) {
            return false;
        }
    },

    /** Stops heartbeat scheduling and optionally deregisters observed instances. */
    stop: async function (deregister) {
        if (this._timer) clearInterval(this._timer);
        this._timer = null;
        if (deregister) await this.deregister();
        return true;
    },

    /** Returns sanitized registration attempt and outcome counters. */
    getDiagnostics: function () { return Object.assign({}, this._metrics, { registeredModuleCount: this._registered.length }); }
};
