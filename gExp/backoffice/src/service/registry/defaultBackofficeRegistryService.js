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
    _instances: new Map(),
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

    /** Validates required identity fields and an approved endpoint scheme. */
    validateRegistration: function (registration) {
        if (!registration || !registration.moduleName || !registration.instanceId || !registration.endpoint) return false;
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
        if (!this.validateRegistration(registration)) {
            this._metrics.rejected++;
            return Promise.reject(new CLASSES.NodicsError('ERR_BOF_00000', 'Invalid module registration'));
        }
        let key = registration.moduleName + ':' + registration.instanceId;
        let existing = this._instances.get(key);
        let now = Date.now();
        let leaseTtlMs = Math.max(1000, Number(registration.leaseTtlMs || this.getConfiguration().leaseTtlMs || 30000));
        let observed = {
            moduleName: String(registration.moduleName),
            instanceId: String(registration.instanceId),
            version: String(registration.version || 'unknown'),
            capabilities: Array.isArray(registration.capabilities) ? registration.capabilities.map(String) : [],
            endpoint: String(registration.endpoint),
            healthPath: String(registration.healthPath || '/nodics/system/v0/health/ready'),
            state: 'UP',
            registeredAt: existing ? existing.registeredAt : new Date(now).toISOString(),
            lastSeenAt: new Date(now).toISOString(),
            expiresAt: now + leaseTtlMs
        };
        this._instances.set(key, observed);
        existing ? this._metrics.renewals++ : this._metrics.registrations++;
        return Promise.resolve({ code: 'SUC_BOF_00000', data: this.projectClientSafe(observed) });
    },

    /** Removes matching observed leases during graceful process drain. */
    deregister: function (request) {
        let instanceId = request.params && request.params.instanceId || request.instanceId;
        let moduleName = request.body && request.body.moduleName || request.moduleName;
        let removed = 0;
        this._instances.forEach((value, key) => {
            if (value.instanceId === instanceId && (!moduleName || value.moduleName === moduleName)) {
                this._instances.delete(key);
                removed++;
            }
        });
        this._metrics.deregistrations += removed;
        return Promise.resolve({ code: 'SUC_BOF_00001', data: { removed: removed } });
    },

    /** Returns active leases grouped by module using client-safe projection. */
    list: function () {
        this.expireStale();
        let modules = {};
        this._instances.forEach(instance => {
            modules[instance.moduleName] = modules[instance.moduleName] || [];
            modules[instance.moduleName].push(this.projectClientSafe(instance));
        });
        return Promise.resolve({ code: 'SUC_BOF_00002', data: { modules: modules } });
    },

    /** Returns sanitized registry size and lifecycle counters. */
    diagnostics: function () {
        this.expireStale();
        return Promise.resolve({
            code: 'SUC_BOF_00003',
            data: { activeInstances: this._instances.size, metrics: Object.assign({}, this._metrics) }
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
        this._instances.forEach((instance, key) => {
            if (instance.expiresAt <= now) {
                this._instances.delete(key);
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
