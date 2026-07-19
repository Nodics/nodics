/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module backoffice/service/registry/DefaultBackofficeRegistryService
 * @description Owns ephemeral observed module-instance leases for BackOffice discovery without becoming topology or activation authority.
 * @layer service
 * @owner backoffice
 * @override Later modules may replace storage or reconciliation while preserving lease, security, and client-safe projection contracts.
 */
module.exports = {
    _sweepTimer: null,
    _metrics: { registrations: 0, renewals: 0, deregistrations: 0, expirations: 0, rejected: 0 },

    /** Starts lease expiry and registers shutdown cleanup with the central lifecycle. */
    init: function () {
        this.startSweeper();
        if (SERVICE.DefaultRuntimeLifecycleService) {
            SERVICE.DefaultRuntimeLifecycleService.registerContributor('backofficeRegistry', {
                order: 800,
                shutdown: () => this.stopSweeper()
            });
        }
        return Promise.resolve(true);
    },

    /** Completes the standard service post-initialization contract. */
    postInit: function () { return Promise.resolve(true); },

    /** Returns effective registry lease and projection policy. */
    getConfiguration: function () { return CONFIG.get('backofficeRegistry') || {}; },

    /** Returns the configured lease-store implementation without creating a second authority path. */
    getStore: function () {
        let store = this._store || SERVICE.DefaultBackofficeRegistryStoreService;
        if (!store) throw new Error('BackOffice registry store service is not initialized');
        return store;
    },

    /** Validates required identity fields and an approved endpoint scheme. */
    validateRegistration: function (registration) {
        if (!registration || !registration.moduleName || !registration.instanceId) return false;
        if (registration.clientCallable !== true) return !registration.endpoint;
        if (!registration.endpoint) return false;
        try {
            let endpoint = new URL(registration.endpoint);
            return (this.getConfiguration().allowedSchemes || ['http', 'https']).includes(endpoint.protocol.replace(':', ''));
        } catch (error) {
            return false;
        }
    },

    /** Creates or renews an idempotent observed module-instance lease. */
    register: function (request) {
        let registration = request.body || request;
        if (!request._identityValidated && !this.validateServiceIdentity(request, registration)) {
            this._metrics.rejected++;
            return Promise.reject(new CLASSES.NodicsError('ERR_AUTH_00003', 'Module registration identity mismatch'));
        }
        if (Array.isArray(registration.registrations)) return this.registerBatch(registration, request.authData);
        if (!this.validateRegistration(registration)) {
            this._metrics.rejected++;
            return Promise.reject(new CLASSES.NodicsError('ERR_BOF_00000', 'Invalid module registration'));
        }
        let key = registration.moduleName + ':' + registration.instanceId;
        let store = this.getStore();
        let existing = store.get(key);
        let now = Date.now();
        let leaseTtlMs = Math.max(1000, Number(registration.leaseTtlMs || this.getConfiguration().leaseTtlMs || 30000));
        let observed = {
            moduleName: String(registration.moduleName),
            instanceId: String(registration.instanceId),
            version: String(registration.version || 'unknown'),
            moduleKind: String(registration.moduleKind || 'unknown'),
            capabilities: Array.isArray(registration.capabilities) ? registration.capabilities.map(String) : [],
            clientCallable: registration.clientCallable === true,
            endpoint: registration.endpoint ? String(registration.endpoint) : undefined,
            healthPath: String(registration.healthPath || '/nodics/system/v0/health/ready'),
            state: 'UP',
            registeredAt: existing ? existing.registeredAt : new Date(now).toISOString(),
            lastSeenAt: new Date(now).toISOString(),
            expiresAt: now + leaseTtlMs
        };
        store.set(key, observed);
        existing ? this._metrics.renewals++ : this._metrics.registrations++;
        return Promise.resolve({ code: 'SUC_BOF_00000', data: this.projectClientSafe(observed) });
    },

    /** Registers one bounded runtime-instance batch while preserving per-module leases. */
    registerBatch: function (batch, authData) {
        let registrations = batch.registrations || [];
        let limit = Number(this.getConfiguration().maxModulesPerRegistration || 512);
        if (!batch.instanceId || registrations.length === 0 || registrations.length > limit ||
            registrations.some(item => item.instanceId !== batch.instanceId)) {
            this._metrics.rejected++;
            return Promise.reject(new CLASSES.NodicsError('ERR_BOF_00000', 'Invalid module registration batch'));
        }
        return Promise.all(registrations.map(item => this.register(Object.assign({ _identityValidated: true }, item)))).then(results => ({
            code: 'SUC_BOF_00000',
            data: { instanceId: batch.instanceId, registeredModules: results.length }
        }));
    },

    /** Validates that a service token is bound to the runtime instance and every declared module. */
    validateServiceIdentity: function (request, registration) {
        if (this.getConfiguration().requireBoundServiceIdentity === false) return true;
        let authData = request.authData || {};
        let registrations = registration.registrations || [registration];
        let instanceId = registration.instanceId || registrations[0] && registrations[0].instanceId;
        return authData.tokenType === 'service' && authData.runtimeInstanceId === instanceId &&
            Array.isArray(authData.modules) && registrations.every(item => authData.modules.includes(item.moduleName));
    },

    /** Removes matching observed leases during graceful process drain. */
    deregister: function (request) {
        let instanceId = request.params && request.params.instanceId || request.instanceId;
        let moduleName = request.body && request.body.moduleName || request.moduleName;
        if (this.getConfiguration().requireBoundServiceIdentity !== false &&
            (!request.authData || request.authData.tokenType !== 'service' || request.authData.runtimeInstanceId !== instanceId)) {
            this._metrics.rejected++;
            return Promise.reject(new CLASSES.NodicsError('ERR_AUTH_00003', 'Module deregistration identity mismatch'));
        }
        let removed = 0;
        this.getStore().forEach((value, key) => {
            if (value.instanceId === instanceId && (!moduleName || value.moduleName === moduleName)) {
                this.getStore().delete(key);
                removed++;
            }
        });
        this._metrics.deregistrations += removed;
        return Promise.resolve({ code: 'SUC_BOF_00001', data: { removed: removed } });
    },

    /** Returns active leases grouped by module using client-safe projection. */
    list: function (request) {
        this.expireStale();
        let modules = {};
        this.getStore().forEach(instance => {
            if (!instance.clientCallable || !this.isModuleAuthorized(instance.moduleName, request && request.authData)) return;
            modules[instance.moduleName] = modules[instance.moduleName] || [];
            modules[instance.moduleName].push(this.projectClientSafe(instance));
        });
        return Promise.resolve({ code: 'SUC_BOF_00002', data: { modules: modules } });
    },

    /** Determines whether the caller may discover a configured module capability. */
    isModuleAuthorized: function (moduleName, authData) {
        let required = (this.getConfiguration().modulePermissions || {})[moduleName];
        if (!required) return true;
        let permissions = authData && authData.permissions || [];
        return permissions.includes('*') || [].concat(required).every(permission => permissions.includes(permission));
    },

    /** Builds a non-authoritative availability summary from currently valid observed leases. */
    buildAvailability: function (modules) {
        let availability = {};
        Object.keys(modules).forEach(moduleName => {
            availability[moduleName] = {
                state: modules[moduleName].length > 0 ? 'AVAILABLE' : 'UNAVAILABLE',
                activeInstances: modules[moduleName].length
            };
        });
        return availability;
    },

    /** Returns the authorized module catalogue and compatibility metadata required to bootstrap a BackOffice client. */
    bootstrap: function (request) {
        return this.list(request).then(result => ({
            code: 'SUC_BOF_00004',
            data: {
                compatibility: Object.assign({}, this.getConfiguration().compatibility || {}),
                modules: result.data.modules,
                availability: this.buildAvailability(result.data.modules)
            }
        }));
    },

    /** Returns sanitized registry size and lifecycle counters. */
    diagnostics: function () {
        this.expireStale();
        return Promise.resolve({
            code: 'SUC_BOF_00003',
            data: { activeInstances: this.getStore().size(), metrics: Object.assign({}, this._metrics) }
        });
    },

    /** Projects only configured fields approved for BackOffice clients. */
    projectClientSafe: function (instance) {
        let result = {};
        (this.getConfiguration().clientSafeMetadata || []).forEach(name => { if (instance[name] !== undefined) result[name] = instance[name]; });
        return result;
    },

    /** Removes every lease whose bounded expiry time has elapsed. */
    expireStale: function () {
        let now = Date.now();
        this.getStore().forEach((instance, key) => {
            if (instance.expiresAt <= now) {
                this.getStore().delete(key);
                this._metrics.expirations++;
            }
        });
    },

    /** Starts the single unreferenced background lease expiry timer. */
    startSweeper: function () {
        if (this._sweepTimer) return this._sweepTimer;
        let interval = Number(this.getConfiguration().sweepIntervalMs || 5000);
        this._sweepTimer = setInterval(() => this.expireStale(), interval);
        if (this._sweepTimer.unref) this._sweepTimer.unref();
        return this._sweepTimer;
    },

    /** Stops lease expiry scheduling during shutdown. */
    stopSweeper: function () {
        if (this._sweepTimer) clearInterval(this._sweepTimer);
        this._sweepTimer = null;
        return Promise.resolve(true);
    }
};
