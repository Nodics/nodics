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
        if (SERVICE.DefaultHealthService) {
            SERVICE.DefaultHealthService.registerReadinessContributor('backofficeRegistryStore', {
                required: true,
                order: 390,
                description: 'Configured BackOffice registry store is available',
                check: () => this.getStore().diagnostics().available
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

    /** Records one sanitized registry audit event under configured fail-open or fail-closed policy. */
    audit: function (event) {
        let service = SERVICE.DefaultBackofficeAuditService;
        if (!service || typeof service.record !== 'function') return Promise.resolve(false);
        return service.record(event).catch(error => {
            if ((this.getConfiguration().audit || {}).failClosed === true) throw error;
            if (this.LOG && this.LOG.error) this.LOG.error('BackOffice audit publication failed', error);
            return false;
        });
    },

    /** Validates required identity fields and an approved endpoint scheme. */
    validateRegistration: function (registration) {
        if (!SERVICE.DefaultBackofficeContractService.validateRegistration(registration)) return false;
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
    register: async function (request) {
        let registration = request.body || request;
        if (!request._identityValidated && !this.validateServiceIdentity(request, registration)) {
            this._metrics.rejected++;
            await this.audit({ eventType: 'backoffice.registry.registration', outcome: 'rejected', reasonCode: 'IDENTITY_MISMATCH',
                instanceId: registration.instanceId, tokenType: request.authData && request.authData.tokenType });
            throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Module registration identity mismatch');
        }
        if (Array.isArray(registration.registrations)) return this.registerBatch(registration, request.authData);
        if (!this.validateRegistration(registration)) {
            this._metrics.rejected++;
            await this.audit({ eventType: 'backoffice.registry.registration', outcome: 'rejected', reasonCode: 'CONTRACT_INVALID',
                moduleName: registration && registration.moduleName, instanceId: registration && registration.instanceId });
            throw new CLASSES.NodicsError('ERR_BOF_00000', 'Invalid module registration');
        }
        let key = registration.moduleName + ':' + registration.instanceId;
        let store = this.getStore();
        let existing = await store.get(key);
        let now = Date.now();
        let leaseTtlMs = Math.max(1000, Number(registration.leaseTtlMs || this.getConfiguration().leaseTtlMs || 30000));
        let observed = {
            moduleName: String(registration.moduleName),
            instanceId: String(registration.instanceId),
            version: String(registration.version || 'unknown'),
            moduleKind: String(registration.moduleKind || 'unknown'),
            capabilities: Array.isArray(registration.capabilities) ? registration.capabilities.map(String) : [],
            clientCallable: registration.clientCallable === true,
            backoffice: registration.backoffice ? JSON.parse(JSON.stringify(registration.backoffice)) : undefined,
            endpoint: registration.endpoint ? String(registration.endpoint) : undefined,
            healthPath: String(registration.healthPath || '/nodics/system/v0/health/ready'),
            state: 'UP',
            registeredAt: existing ? existing.registeredAt : new Date(now).toISOString(),
            lastSeenAt: new Date(now).toISOString(),
            expiresAt: now + leaseTtlMs
        };
        await store.set(key, observed, leaseTtlMs);
        if (SERVICE.DefaultBackofficeDiscoveryService) SERVICE.DefaultBackofficeDiscoveryService.scheduleDiscovery(observed, request.authData);
        existing ? this._metrics.renewals++ : this._metrics.registrations++;
        if (request._batchOutcomes) request._batchOutcomes.push(existing ? 'renewed' : 'registered');
        if (!request._batchRegistration) await this.audit({ eventType: 'backoffice.registry.registration',
            outcome: existing ? 'renewed' : 'registered', moduleName: observed.moduleName, instanceId: observed.instanceId, moduleCount: 1 });
        return { code: 'SUC_BOF_00000', data: this.projectClientSafe(observed) };
    },

    /** Registers one bounded runtime-instance batch while preserving per-module leases. */
    registerBatch: function (batch, authData) {
        let registrations = batch.registrations || [];
        let limit = Number(this.getConfiguration().maxModulesPerRegistration || 512);
        if (!SERVICE.DefaultBackofficeContractService.validateRegistrationBatch(batch, limit)) {
            this._metrics.rejected++;
            return Promise.reject(new CLASSES.NodicsError('ERR_BOF_00000', 'Invalid module registration batch'));
        }
        let outcomes = [];
        return Promise.all(registrations.map(item => this.register({ body: item, _identityValidated: true,
            _batchRegistration: true, _batchOutcomes: outcomes, authData: authData })))
            .then(results => this.audit({ eventType: 'backoffice.registry.registration',
                outcome: outcomes.every(outcome => outcome === 'renewed') ? 'renewed' :
                    outcomes.every(outcome => outcome === 'registered') ? 'registered' : 'reconciled',
                instanceId: batch.instanceId, moduleCount: results.length }).then(() => ({
                    code: 'SUC_BOF_00000', data: { instanceId: batch.instanceId, registeredModules: results.length }
                })));
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
    deregister: async function (request) {
        let instanceId = request.params && request.params.instanceId || request.instanceId;
        let moduleName = request.body && request.body.moduleName || request.moduleName;
        if (this.getConfiguration().requireBoundServiceIdentity !== false &&
            (!request.authData || request.authData.tokenType !== 'service' || request.authData.runtimeInstanceId !== instanceId)) {
            this._metrics.rejected++;
            await this.audit({ eventType: 'backoffice.registry.deregistration', outcome: 'rejected', reasonCode: 'IDENTITY_MISMATCH',
                instanceId: instanceId, tokenType: request.authData && request.authData.tokenType });
            throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Module deregistration identity mismatch');
        }
        let removed = 0;
        let entries = await this.getStore().values();
        await Promise.all(entries.map(async entry => {
            let value = entry.value;
            if (value.instanceId === instanceId && (!moduleName || value.moduleName === moduleName)) {
                await this.getStore().delete(entry.key);
                removed++;
            }
        }));
        this._metrics.deregistrations += removed;
        await this.audit({ eventType: 'backoffice.registry.deregistration', outcome: 'removed', instanceId: instanceId,
            moduleName: moduleName, moduleCount: removed });
        return { code: 'SUC_BOF_00001', data: { removed: removed } };
    },

    /** Returns active leases grouped by module using client-safe projection. */
    list: async function (request) {
        await this.expireStale();
        let modules = {};
        let entries = await this.getStore().values();
        entries.forEach(entry => {
            let instance = entry.value;
            if (!instance.clientCallable || !this.isModuleAuthorized(instance.moduleName, request && request.authData, instance)) return;
            modules[instance.moduleName] = modules[instance.moduleName] || [];
            modules[instance.moduleName].push(this.projectClientSafe(instance));
        });
        return { code: 'SUC_BOF_00002', data: { modules: modules } };
    },

    /** Determines whether the caller may discover a configured module capability. */
    isModuleAuthorized: function (moduleName, authData, instance) {
        let required = (this.getConfiguration().modulePermissions || {})[moduleName] ||
            instance && instance.backoffice && instance.backoffice.requiredPermissions;
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

    /** Resolves a positive client contract version from the request or configured minimum. */
    getClientContractVersion: function (request) {
        let headers = request && (request.headers || request.httpRequest && request.httpRequest.headers) || {};
        let configured = this.getConfiguration().compatibility || {};
        let value = headers['x-nodics-client-contract-version'] || configured.minimumClientContractVersion || 1;
        let version = Number(value);
        if (!Number.isInteger(version) || version < 1) throw new CLASSES.NodicsError('ERR_BOF_00000', 'Invalid client contract version');
        return version;
    },

    /** Evaluates one module catalogue contract against the requesting client version. */
    evaluateCompatibility: function (metadata, clientContractVersion) {
        let moduleContractVersion = Number(metadata && metadata.contractVersion || 1);
        let minimumClientContractVersion = Number(metadata && metadata.minimumClientContractVersion || 1);
        let status = clientContractVersion < minimumClientContractVersion ? 'INCOMPATIBLE' :
            clientContractVersion < moduleContractVersion ? 'DEGRADED' : 'COMPATIBLE';
        return { clientContractVersion, moduleContractVersion, minimumClientContractVersion, status };
    },

    /** Aggregates authorized module-owned catalogue metadata without becoming its source of truth. */
    buildCatalogue: function (modules, clientContractVersion) {
        let catalogue = {};
        Object.keys(modules).forEach(moduleName => {
            let instances = modules[moduleName];
            let metadata = instances.map(instance => instance.backoffice).find(value => value && value.enabled !== false);
            if (!metadata) return;
            let snapshot = SERVICE.DefaultBackofficeDiscoveryService && SERVICE.DefaultBackofficeDiscoveryService.getSnapshot(moduleName);
            catalogue[moduleName] = Object.assign({}, metadata, {
                moduleName: moduleName,
                activeModuleLeases: instances.length,
                compatibility: this.evaluateCompatibility(metadata, clientContractVersion),
                contract: snapshot
            });
        });
        return catalogue;
    },

    /** Returns the most restrictive compatibility state from an authorized catalogue. */
    getOverallCompatibilityStatus: function (catalogue) {
        let statuses = Object.keys(catalogue).map(moduleName => catalogue[moduleName].compatibility.status);
        if (statuses.includes('INCOMPATIBLE')) return 'INCOMPATIBLE';
        if (statuses.includes('DEGRADED')) return 'DEGRADED';
        return 'COMPATIBLE';
    },

    /** Selects one authorized compatible UI-composition provider from module-owned metadata and layered preference. */
    selectUiComposition: function (catalogue) {
        let config = this.getConfiguration().uiComposition || {};
        let fallback = { enabled: false, fallbackMode: 'STATIC_RECOVERY_SHELL' };
        if (config.enabled === false) return fallback;
        let role = config.providerRole || 'UI_COMPOSITION_PROVIDER';
        let providers = Object.keys(catalogue).filter(moduleName => {
            let metadata = catalogue[moduleName];
            return Array.isArray(metadata.roles) && metadata.roles.includes(role) && metadata.uiComposition &&
                metadata.compatibility.status !== 'INCOMPATIBLE';
        }).sort();
        let providerModule = config.preferredModule && providers.includes(config.preferredModule) ? config.preferredModule : providers[0];
        if (!providerModule) return fallback;
        return Object.assign({ enabled: true, providerModule: providerModule }, catalogue[providerModule].uiComposition);
    },

    /** Returns the authorized module catalogue and compatibility metadata required to bootstrap a BackOffice client. */
    bootstrap: async function (request) {
        let clientContractVersion = this.getClientContractVersion(request);
        let result = await this.list(request);
        let catalogue = this.buildCatalogue(result.data.modules, clientContractVersion);
        let configured = this.getConfiguration().compatibility || {};
        let status = this.getOverallCompatibilityStatus(catalogue);
        if (status !== 'COMPATIBLE') {
            await this.audit({
                eventType: 'backoffice.registry.compatibility',
                outcome: 'evaluated',
                compatibilityStatus: status,
                moduleCount: Object.keys(catalogue).length
            });
        }
        return {
            code: 'SUC_BOF_00004',
            data: {
                compatibility: Object.assign({}, configured, {
                    clientContractVersion: clientContractVersion,
                    status: status
                }),
                modules: result.data.modules,
                catalogue: catalogue,
                availability: this.buildAvailability(result.data.modules),
                uiComposition: this.selectUiComposition(catalogue)
            }
        };
    },

    /** Returns sanitized registry size and lifecycle counters. */
    diagnostics: async function (request) {
        await this.expireStale();
        let activeModuleLeases = await this.getStore().size();
        let repository = SERVICE.DefaultBackofficeContractRepositoryService;
        return {
            code: 'SUC_BOF_00003',
            data: {
                activeModuleLeases: activeModuleLeases,
                activeInstances: activeModuleLeases,
                metrics: Object.assign({}, this._metrics),
                store: this.getStore().diagnostics(),
                discovery: SERVICE.DefaultBackofficeDiscoveryService ? SERVICE.DefaultBackofficeDiscoveryService.getDiagnostics() : undefined,
                contracts: repository && typeof repository.getOperationalDiagnostics === 'function' ?
                    await repository.getOperationalDiagnostics(request) : undefined
            }
        };
    },

    /** Projects only configured fields approved for BackOffice clients. */
    projectClientSafe: function (instance) {
        let result = {};
        (this.getConfiguration().clientSafeMetadata || []).forEach(name => { if (instance[name] !== undefined) result[name] = instance[name]; });
        return result;
    },

    /** Removes every lease whose bounded expiry time has elapsed. */
    expireStale: async function () {
        let now = Date.now();
        let entries = await this.getStore().values();
        let expired = 0;
        await Promise.all(entries.map(async entry => {
            let instance = entry.value;
            if (instance.expiresAt <= now) {
                await this.getStore().delete(entry.key);
                this._metrics.expirations++;
                expired++;
            }
        }));
        if (expired > 0) await this.audit({ eventType: 'backoffice.registry.expiry', outcome: 'expired', moduleCount: expired });
    },

    /** Starts the single unreferenced background lease expiry timer. */
    startSweeper: function () {
        if (this._sweepTimer) return this._sweepTimer;
        let interval = Number(this.getConfiguration().sweepIntervalMs || 5000);
        this._sweepTimer = setInterval(() => this.expireStale().catch(error => {
            if (this.LOG && this.LOG.error) this.LOG.error('BackOffice registry lease sweep failed', error);
        }), interval);
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
