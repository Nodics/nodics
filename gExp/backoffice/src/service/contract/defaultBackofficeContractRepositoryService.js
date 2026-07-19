/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module backoffice/service/contract/DefaultBackofficeContractRepositoryService
 * @description Persists immutable normalized contract observations and selects active hashes through an optimistic compare-and-set pointer.
 * @layer service
 * @owner backoffice
 * @override Projects may replace persistence while preserving target-contract authority, immutable hashes, tenant isolation, CAS activation, retention, and audit semantics.
 */
module.exports = {
    /** Initializes the contract repository. */
    init: function () { return Promise.resolve(true); },
    /** Completes repository initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns effective history, approval, and retention policy. */
    getConfiguration: function () { return (CONFIG.get('backofficeRegistry') || {}).contractHistory || {}; },
    /** Resolves the tenant used for BackOffice-owned operational observations. */
    getTenant: function (request) { return request && request.tenant || CONFIG.get('defaultTenant') || 'default'; },
    /** Returns the generated schema services without bypassing Nodics persistence pipelines. */
    getServices: function () {
        let snapshot = SERVICE.DefaultBackofficeContractSnapshotService;
        let activation = SERVICE.DefaultBackofficeContractActivationService;
        if (!snapshot || !activation) {
            let error = new Error('BackOffice contract persistence services are unavailable');
            error.code = 'PERSISTENCE_UNAVAILABLE';
            throw error;
        }
        return { snapshot: snapshot, activation: activation };
    },
    /** Extracts generated-service result arrays consistently. */
    getItems: function (response) { return response && Array.isArray(response.result) ? response.result : []; },
    /** Extracts affected row counts from supported database adapter response shapes. */
    getAffectedCount: function (response) {
        let result = response && response.result !== undefined ? response.result : response;
        if (!result) return 0;
        if (typeof result.modifiedCount === 'number') return result.modifiedCount;
        if (typeof result.nModified === 'number') return result.nModified;
        if (typeof result.n === 'number') return result.n;
        if (result.result) return this.getAffectedCount(result.result);
        return 0;
    },
    /** Creates the deterministic immutable snapshot code. */
    createSnapshotCode: function (moduleName, hash) { return moduleName + '_' + hash; },
    /** Resolves a sanitized actor identifier from authenticated request context. */
    getActor: function (request, fallback) {
        let authData = request && request.authData || {};
        return String(authData.principalId || authData.code || authData.loginId || fallback || 'backoffice-discovery');
    },
    /** Finds one snapshot by module and normalized hash. */
    getSnapshot: async function (moduleName, hash, request) {
        let response = await this.getServices().snapshot.get({ tenant: this.getTenant(request), authData: request && request.authData,
            query: { code: this.createSnapshotCode(moduleName, hash), moduleName: moduleName, contractHash: hash }, searchOptions: { limit: 1 } });
        return this.getItems(response)[0];
    },
    /** Returns bounded snapshot history newest first. */
    getHistory: async function (moduleName, request) {
        let limit = Math.max(1, Number(request && request.limit || this.getConfiguration().historyLimit || 50));
        let response = await this.getServices().snapshot.get({ tenant: this.getTenant(request), authData: request && request.authData,
            query: { moduleName: moduleName }, searchOptions: { limit: limit, sort: { discoveredAt: -1 } } });
        return this.getItems(response);
    },
    /** Returns the optimistic active-hash pointer for one module. */
    getActivation: async function (moduleName, request) {
        let response = await this.getServices().activation.get({ tenant: this.getTenant(request), authData: request && request.authData,
            query: { code: moduleName, moduleName: moduleName }, searchOptions: { limit: 1 } });
        return this.getItems(response)[0];
    },
    /** Returns the active normalized snapshot selected by the durable pointer. */
    getActiveSnapshot: async function (moduleName, request) {
        let activation = await this.getActivation(moduleName, request);
        if (!activation) return undefined;
        let snapshot = await this.getSnapshot(moduleName, activation.activeHash, request);
        return snapshot ? Object.assign({}, snapshot, { activationRevision: activation.revision }) : undefined;
    },
    /** Saves one immutable observation idempotently. */
    saveSnapshot: async function (snapshot, state, request) {
        let existing = await this.getSnapshot(snapshot.moduleName, snapshot.hash, request);
        if (existing) return existing;
        let model = {
            code: this.createSnapshotCode(snapshot.moduleName, snapshot.hash), active: true,
            moduleName: snapshot.moduleName, contractType: snapshot.contractType,
            contractVersion: snapshot.contractVersion, contractHash: snapshot.hash,
            operations: snapshot.operations, schemas: snapshot.schemas, state: state,
            changeClassification: snapshot.changeClassification, revision: 0,
            discoveredAt: new Date(snapshot.discoveredAt), sourceInstanceId: request && request.sourceInstanceId
        };
        try {
            let response = await this.getServices().snapshot.save({ tenant: this.getTenant(request), authData: request && request.authData, model: model });
            return this.getItems(response)[0] || response.result || model;
        } catch (error) {
            existing = await this.getSnapshot(snapshot.moduleName, snapshot.hash, request);
            if (existing) return existing;
            throw error;
        }
    },
    /** Updates snapshot decision state with compare-and-set revision protection. */
    updateSnapshotState: async function (snapshot, nextState, request, decision) {
        let model = { state: nextState, revision: Number(snapshot.revision || 0) + 1 };
        if (decision) Object.assign(model, {
            decidedAt: new Date(), decidedBy: this.getActor(request), decisionReason: decision.reason
        });
        let response = await this.getServices().snapshot.update({ tenant: this.getTenant(request), authData: request && request.authData,
            query: { code: snapshot.code, revision: Number(snapshot.revision || 0) }, model: model });
        if (this.getAffectedCount(response) !== 1) throw new CLASSES.NodicsError('ERR_BOF_00000', 'Contract snapshot decision conflict');
        return Object.assign({}, snapshot, model);
    },
    /** Creates or compare-and-set updates the durable active-hash pointer. */
    activateHash: async function (moduleName, hash, request) {
        let services = this.getServices();
        let current = await this.getActivation(moduleName, request);
        let now = new Date();
        let actor = this.getActor(request);
        let expectedRevision = request && request.expectedRevision;
        if (!current) {
            if (expectedRevision !== undefined && Number(expectedRevision) !== 0) throw new CLASSES.NodicsError('ERR_BOF_00000', 'Contract activation revision conflict');
            try {
                await services.activation.save({ tenant: this.getTenant(request), authData: request && request.authData, model: {
                    code: moduleName, active: true, moduleName: moduleName, activeHash: hash, revision: 1,
                    activatedAt: now, activatedBy: actor, activationReason: request && request.reason
                } });
                return { moduleName: moduleName, activeHash: hash, revision: 1 };
            } catch (error) {
                current = await this.getActivation(moduleName, request);
                if (!current) throw error;
            }
        }
        if (current.activeHash === hash) return current;
        if (expectedRevision !== undefined && Number(expectedRevision) !== Number(current.revision)) {
            throw new CLASSES.NodicsError('ERR_BOF_00000', 'Contract activation revision conflict');
        }
        let next = { activeHash: hash, previousHash: current.activeHash, revision: Number(current.revision) + 1,
            activatedAt: now, activatedBy: actor, activationReason: request && request.reason };
        let response = await services.activation.update({ tenant: this.getTenant(request), authData: request && request.authData,
            query: { code: moduleName, revision: Number(current.revision) }, model: next });
        if (this.getAffectedCount(response) !== 1) throw new CLASSES.NodicsError('ERR_BOF_00000', 'Contract activation revision conflict');
        return Object.assign({}, current, next);
    },
    /** Persists a discovered candidate and automatically selects only safe classifications. */
    recordDiscovery: async function (snapshot, request) {
        let configuration = this.getConfiguration();
        let approvalClassifications = configuration.approvalClassifications || ['POTENTIALLY_BREAKING', 'BREAKING'];
        let automaticClassifications = configuration.automaticClassifications || ['INITIAL', 'UNCHANGED', 'NON_BREAKING'];
        let requiresApproval = approvalClassifications.includes(snapshot.changeClassification);
        if (!requiresApproval && !automaticClassifications.includes(snapshot.changeClassification)) {
            throw new CLASSES.NodicsError('ERR_BOF_00000', 'Contract change classification is not governed');
        }
        let persisted = await this.saveSnapshot(snapshot, requiresApproval ? 'PENDING_APPROVAL' : 'DISCOVERED', request);
        if (!requiresApproval) {
            let previous = await this.getActiveSnapshot(snapshot.moduleName, request);
            await this.activateHash(snapshot.moduleName, snapshot.hash, Object.assign({}, request, { reason: 'safe-discovery' }));
            if (previous && previous.contractHash !== snapshot.hash && previous.state === 'ACTIVE') {
                await this.updateSnapshotState(previous, 'SUPERSEDED', request).catch(() => false);
            }
            if (persisted.state !== 'ACTIVE') persisted = await this.updateSnapshotState(persisted, 'ACTIVE', request).catch(() =>
                Object.assign({}, persisted, { state: 'ACTIVE' }));
        }
        await this.enforceRetention(snapshot.moduleName, request);
        return persisted;
    },
    /** Approves a pending candidate and atomically advances the active pointer revision. */
    approve: async function (moduleName, hash, request) {
        let candidate = await this.getSnapshot(moduleName, hash, request);
        if (!candidate || candidate.state !== 'PENDING_APPROVAL') throw new CLASSES.NodicsError('ERR_BOF_00000', 'Pending contract candidate not found');
        if (!request || !request.reason) throw new CLASSES.NodicsError('ERR_BOF_00000', 'Approval reason is required');
        let previous = await this.getActiveSnapshot(moduleName, request);
        let activation = await this.activateHash(moduleName, hash, request);
        if (previous && previous.contractHash !== hash && previous.state === 'ACTIVE') await this.updateSnapshotState(previous, 'SUPERSEDED', request).catch(() => false);
        let approved = await this.updateSnapshotState(candidate, 'ACTIVE', request, { reason: request.reason });
        return { snapshot: approved, activation: activation };
    },
    /** Rejects a pending candidate using its optimistic snapshot revision. */
    reject: async function (moduleName, hash, request) {
        let candidate = await this.getSnapshot(moduleName, hash, request);
        if (!candidate || candidate.state !== 'PENDING_APPROVAL') throw new CLASSES.NodicsError('ERR_BOF_00000', 'Pending contract candidate not found');
        if (!request || !request.reason) throw new CLASSES.NodicsError('ERR_BOF_00000', 'Rejection reason is required');
        let activation = await this.getActivation(moduleName, request);
        if (!activation || Number(request.expectedRevision) !== Number(activation.revision)) {
            throw new CLASSES.NodicsError('ERR_BOF_00000', 'Contract activation revision conflict');
        }
        return this.updateSnapshotState(candidate, 'REJECTED', request, { reason: request.reason });
    },
    /** Selects a retained historical snapshot as a new active pointer revision. */
    rollback: async function (moduleName, hash, request) {
        let target = await this.getSnapshot(moduleName, hash, request);
        if (!target || target.state === 'REJECTED') throw new CLASSES.NodicsError('ERR_BOF_00000', 'Rollback contract snapshot not found');
        if (!request || !request.reason) throw new CLASSES.NodicsError('ERR_BOF_00000', 'Rollback reason is required');
        let previous = await this.getActiveSnapshot(moduleName, request);
        let activation = await this.activateHash(moduleName, hash, request);
        if (previous && previous.contractHash !== hash && previous.state === 'ACTIVE') await this.updateSnapshotState(previous, 'SUPERSEDED', request).catch(() => false);
        if (target.state !== 'ACTIVE') target = await this.updateSnapshotState(target, 'ACTIVE', request, { reason: request.reason });
        return { snapshot: target, activation: activation };
    },
    /** Removes only old inactive history beyond configured retention while protecting active and pending records. */
    enforceRetention: async function (moduleName, request) {
        let retention = Math.max(2, Number(this.getConfiguration().retentionPerModule || 25));
        let history = await this.getHistory(moduleName, Object.assign({}, request, { limit: retention + 100 }));
        let removable = history.slice(retention).filter(item => !['ACTIVE', 'PENDING_APPROVAL'].includes(item.state));
        await Promise.all(removable.map(item => this.getServices().snapshot.remove({ tenant: this.getTenant(request),
            authData: request && request.authData, query: { code: item.code, revision: item.revision } }).catch(() => false)));
        return removable.length;
    }
};
