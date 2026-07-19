/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
const crypto = require('crypto');

/**
 * @module backoffice/service/discovery/DefaultBackofficeDiscoveryService
 * @description Discovers effective Nodics contracts through existing System APIs and maintains normalized, client-safe observed snapshots.
 * @layer service
 * @owner backoffice
 * @override Projects may replace fetching, normalization, or classification while preserving bounded input, source authority, and fail-safe snapshots.
 */
module.exports = {
    _snapshots: new Map(),
    _inflight: new Map(),
    _metrics: { attempts: 0, successes: 0, failures: 0, breakingChanges: 0, lastSuccessAt: null, lastFailureAt: null, lastFailureCode: null },

    /** Initializes the discovery service. */
    init: function () { return Promise.resolve(true); },
    /** Completes discovery service initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns effective bounded discovery policy. */
    getConfiguration: function () { return (CONFIG.get('backofficeRegistry') || {}).discovery || {}; },
    /** Publishes one sanitized background-discovery audit event without delaying module traffic. */
    audit: function (event) {
        let service = SERVICE.DefaultBackofficeAuditService;
        return service && typeof service.record === 'function' ? service.record(event).catch(() => false) : Promise.resolve(false);
    },

    /** Produces stable JSON for hashing independent of property insertion order. */
    stableStringify: function (value) {
        if (Array.isArray(value)) return '[' + value.map(item => this.stableStringify(item)).join(',') + ']';
        if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(key =>
            JSON.stringify(key) + ':' + this.stableStringify(value[key])).join(',') + '}';
        return JSON.stringify(value);
    },

    /** Hashes one normalized contract without retaining the untrusted source document. */
    hashContract: function (contract) {
        return crypto.createHash('sha256').update(this.stableStringify(contract)).digest('hex');
    },

    /** Builds an exact-origin contract URL from the authenticated registration and module-owned relative path. */
    buildContractUrl: function (registration) {
        let metadata = registration.backoffice || {};
        let path = metadata.discovery && metadata.discovery.openApiPath;
        if (!registration.endpoint || !path || !path.startsWith('/') || path.startsWith('//')) throw new Error('Safe discovery endpoint is required');
        let endpoint = new URL(registration.endpoint);
        if (endpoint.username || endpoint.password || endpoint.hash) throw new Error('Discovery endpoint credentials and fragments are not allowed');
        let allowedSchemes = ((CONFIG.get('backofficeRegistry') || {}).allowedSchemes || ['http', 'https']);
        if (!allowedSchemes.includes(endpoint.protocol.replace(':', ''))) throw new Error('Discovery endpoint scheme is not allowed');
        let allowedHosts = this.getConfiguration().allowedHosts || [];
        if (allowedHosts.length > 0 && !allowedHosts.includes(endpoint.hostname)) throw new Error('Discovery endpoint host is not allowed');
        return endpoint.origin + path;
    },

    /** Fetches the existing System-owned OpenAPI artifact through the shared Nodics transport. */
    fetchContract: async function (registration) {
        let policy = this.getConfiguration();
        let tenant = CONFIG.get('defaultTenant') || 'default';
        let token = NODICS.getInternalAuthToken(tenant);
        if (!token) throw new Error('Internal discovery token is unavailable');
        let request = SERVICE.DefaultModuleService.buildExternalRequest({
            uri: this.buildContractUrl(registration),
            methodName: 'GET',
            header: { Authorization: 'Bearer ' + token },
            timeoutMs: Number(policy.timeoutMs || 3000),
            maxAttempts: 1
        });
        request.maxResponseBytes = Number(policy.maxResponseBytes || 5242880);
        request.followRedirects = policy.allowRedirects === true;
        return SERVICE.DefaultModuleService.fetch(request);
    },

    /** Normalizes only operations owned by the registered module from the effective runtime OpenAPI contract. */
    normalizeOpenApi: function (registration, document) {
        let policy = this.getConfiguration();
        if (!document || document.openapi !== '3.0.3' || !document.paths || typeof document.paths !== 'object') {
            throw new Error('Invalid Nodics OpenAPI contract');
        }
        let paths = Object.keys(document.paths);
        if (paths.length > Number(policy.maxPaths || 5000)) throw new Error('OpenAPI path limit exceeded');
        let operations = [];
        paths.sort().forEach(path => {
            Object.keys(document.paths[path] || {}).sort().forEach(method => {
                if (!['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(method)) return;
                let operation = document.paths[path][method] || {};
                let metadata = operation['x-nodics'] || {};
                if (metadata.moduleName !== registration.moduleName) return;
                operations.push({
                    operationId: String(operation.operationId || registration.moduleName + '_' + method + '_' + path),
                    path: path,
                    method: method.toUpperCase(),
                    schemaName: metadata.schemaName ? String(metadata.schemaName) : undefined,
                    operation: metadata.operation ? String(metadata.operation) : undefined,
                    permissions: [].concat(metadata.permissions || []).map(String).sort()
                });
            });
        });
        if (operations.length > Number(policy.maxOperations || 10000)) throw new Error('OpenAPI operation limit exceeded');
        let schemas = Array.from(new Set(operations.map(item => item.schemaName).filter(Boolean))).sort();
        return {
            moduleName: registration.moduleName,
            contractType: 'OPENAPI',
            contractVersion: Number(registration.backoffice.discovery.contractVersion || 1),
            operations: operations,
            schemas: schemas
        };
    },

    /** Classifies normalized changes without treating observed snapshots as source authority. */
    classifyChange: function (previous, current) {
        if (!previous) return 'INITIAL';
        if (previous.hash === current.hash) return 'UNCHANGED';
        let previousOperations = new Map(previous.operations.map(item => [item.operationId, item]));
        let currentOperations = new Map(current.operations.map(item => [item.operationId, item]));
        if ([...previousOperations.keys()].some(key => !currentOperations.has(key))) return 'BREAKING';
        for (let [key, operation] of previousOperations.entries()) {
            let next = currentOperations.get(key);
            if (next.path !== operation.path || next.method !== operation.method) return 'BREAKING';
            if (operation.permissions.some(permission => !next.permissions.includes(permission)) ||
                next.permissions.some(permission => !operation.permissions.includes(permission))) return 'POTENTIALLY_BREAKING';
        }
        return 'NON_BREAKING';
    },
    /** Converts a durable persistence record back to the normalized in-memory projection. */
    fromPersistedSnapshot: function (snapshot) {
        if (!snapshot) return undefined;
        return {
            moduleName: snapshot.moduleName, contractType: snapshot.contractType, contractVersion: snapshot.contractVersion,
            operations: snapshot.operations || [], schemas: snapshot.schemas || [], hash: snapshot.contractHash,
            discoveredAt: snapshot.discoveredAt, changeClassification: snapshot.changeClassification
        };
    },

    /** Discovers, validates, hashes, classifies, and conditionally activates one observed module contract. */
    discover: async function (registration, suppliedDocument, context) {
        this._metrics.attempts++;
        let state = this._snapshots.get(registration.moduleName) || {};
        state.lastAttemptAt = new Date().toISOString();
        try {
            let document = suppliedDocument || await this.fetchContract(registration);
            let normalized = this.normalizeOpenApi(registration, document);
            normalized.hash = this.hashContract(normalized);
            normalized.discoveredAt = new Date().toISOString();
            let repository = SERVICE.DefaultBackofficeContractRepositoryService;
            let historyPolicy = (CONFIG.get('backofficeRegistry') || {}).contractHistory || {};
            if (historyPolicy.enabled === true && !repository) throw new Error('Durable BackOffice contract repository is unavailable');
            if (!state.active && repository) {
                state.active = this.fromPersistedSnapshot(await repository.getActiveSnapshot(registration.moduleName, {
                    tenant: CONFIG.get('defaultTenant') || 'default', authData: context && context.authData
                }));
            }
            let classification = this.classifyChange(state.active, normalized);
            normalized.changeClassification = classification;
            let persisted;
            if (repository) persisted = await repository.recordDiscovery(normalized, {
                tenant: CONFIG.get('defaultTenant') || 'default', sourceInstanceId: registration.instanceId,
                authData: context && context.authData
            });
            let requiresApproval = persisted ? persisted.state === 'PENDING_APPROVAL' :
                ['POTENTIALLY_BREAKING', 'BREAKING'].includes(classification);
            if (requiresApproval) {
                if (classification === 'BREAKING') this._metrics.breakingChanges++;
                state.candidate = normalized;
                state.lastChangeClassification = classification;
            } else {
                state.active = normalized;
                state.candidate = null;
                state.lastChangeClassification = classification;
            }
            this._snapshots.set(registration.moduleName, state);
            this._metrics.successes++;
            this._metrics.lastSuccessAt = normalized.discoveredAt;
            await this.audit({ eventType: 'backoffice.registry.discovery', outcome: 'discovered',
                moduleName: registration.moduleName, changeClassification: classification });
            return this.getSnapshot(registration.moduleName);
        } catch (error) {
            this._snapshots.set(registration.moduleName, state);
            this._metrics.failures++;
            this._metrics.lastFailureAt = new Date().toISOString();
            this._metrics.lastFailureCode = error.code || error.name || 'DISCOVERY_FAILED';
            await this.audit({ eventType: 'backoffice.registry.discovery', outcome: 'rejected',
                moduleName: registration.moduleName, reasonCode: error.code || 'DISCOVERY_FAILED' });
            throw error;
        }
    },

    /** Schedules deduplicated asynchronous discovery without delaying module registration or traffic readiness. */
    scheduleDiscovery: function (registration, authData) {
        let policy = this.getConfiguration();
        if (policy.enabled === false || !registration.clientCallable || !registration.backoffice || !registration.backoffice.discovery) {
            return Promise.resolve(false);
        }
        let state = this._snapshots.get(registration.moduleName);
        if (state && state.lastAttemptAt && Date.now() - Date.parse(state.lastAttemptAt) < Number(policy.refreshIntervalMs || 300000)) {
            return Promise.resolve(false);
        }
        let key = registration.moduleName + ':' + registration.instanceId;
        if (this._inflight.has(key)) return this._inflight.get(key);
        let promise = Promise.resolve().then(() => this.discover(registration, undefined, { authData: authData })).catch(error => {
            if (this.LOG && this.LOG.warn) this.LOG.warn('BackOffice contract discovery failed', {
                moduleName: registration.moduleName, code: error.code || 'DISCOVERY_FAILED'
            });
            return false;
        }).finally(() => this._inflight.delete(key));
        this._inflight.set(key, promise);
        return promise;
    },

    /** Returns the active safe snapshot and pending breaking-change summary for one module. */
    getSnapshot: function (moduleName) {
        let state = this._snapshots.get(moduleName);
        if (!state || !state.active) return undefined;
        return Object.assign({}, state.active, {
            latestChangeClassification: state.lastChangeClassification,
            candidateHash: state.candidate && state.candidate.hash
        });
    },

    /** Returns safe snapshots for authorized catalogue module names only. */
    getSnapshots: function (moduleNames) {
        let result = {};
        moduleNames.forEach(moduleName => {
            let snapshot = this.getSnapshot(moduleName);
            if (snapshot) result[moduleName] = snapshot;
        });
        return result;
    },

    /** Returns sanitized discovery counters. */
    getDiagnostics: function () { return Object.assign({}, this._metrics, { activeSnapshots: this._snapshots.size, inflight: this._inflight.size }); }
};
