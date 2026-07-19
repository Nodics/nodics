/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module backoffice/service/contract/DefaultBackofficeContractLifecycleService
 * @description Provides secured read, comparison, approval, rejection, and rollback orchestration over durable normalized contract history.
 * @layer service
 * @owner backoffice
 * @override Projects may extend approval policy while preserving explicit permissions, reasons, optimistic revisions, audit, and target-module authority.
 */
module.exports = {
    /** Initializes lifecycle orchestration. */
    init: function () { return Promise.resolve(true); },
    /** Completes lifecycle orchestration initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns the owning durable repository. */
    getRepository: function () { return SERVICE.DefaultBackofficeContractRepositoryService; },
    /** Extracts route parameters from direct and HTTP request shapes. */
    getParams: function (request) { return request && (request.params || request.httpRequest && request.httpRequest.params) || {}; },
    /** Validates module and immutable contract coordinates before persistence access. */
    validateCoordinates: function (request, hashRequired) {
        let params = this.getParams(request);
        if (typeof params.moduleName !== 'string' || !/^[A-Za-z][A-Za-z0-9_-]{0,127}$/.test(params.moduleName)) {
            throw new CLASSES.NodicsError('ERR_BOF_00000', 'A valid module name is required');
        }
        if (hashRequired && (typeof params.hash !== 'string' || !/^[a-f0-9]{64}$/.test(params.hash))) {
            throw new CLASSES.NodicsError('ERR_BOF_00000', 'A valid contract hash is required');
        }
        return params;
    },
    /** Extracts a bounded history limit from direct and HTTP query shapes. */
    getHistoryLimit: function (request) {
        let query = request && (request.query || request.httpRequest && request.httpRequest.query) || {};
        let configured = Number((CONFIG.get('backofficeRegistry') || {}).contractHistory.historyLimit || 50);
        let requested = query.limit === undefined ? configured : Number(query.limit);
        if (!Number.isInteger(requested) || requested < 1) throw new CLASSES.NodicsError('ERR_BOF_00000', 'History limit must be a positive integer');
        return Math.min(requested, Math.max(1, configured));
    },
    /** Extracts a bounded decision body. */
    getDecision: function (request) {
        let body = request && (request.body || request.httpRequest && request.httpRequest.body) || {};
        let reason = typeof body.reason === 'string' ? body.reason.trim() : '';
        if (!reason || reason.length > 1024) throw new CLASSES.NodicsError('ERR_BOF_00000', 'A bounded decision reason is required');
        let expectedRevision = Number(body.expectedRevision);
        if (!Number.isInteger(expectedRevision) || expectedRevision < 0) throw new CLASSES.NodicsError('ERR_BOF_00000', 'Expected activation revision is required');
        return { reason: reason, expectedRevision: expectedRevision };
    },
    /** Projects persistence metadata to the safe administrative contract shape. */
    projectSnapshot: function (snapshot) {
        if (!snapshot) return undefined;
        let result = {};
        ['moduleName', 'contractType', 'contractVersion', 'contractHash', 'operations', 'schemas', 'state',
            'changeClassification', 'revision', 'discoveredAt', 'decidedAt', 'decidedBy', 'decisionReason', 'activationRevision']
            .forEach(key => { if (snapshot[key] !== undefined) result[key] = snapshot[key]; });
        return result;
    },
    /** Returns the active durable snapshot for one module. */
    current: async function (request) {
        SERVICE.DefaultBackofficeAdministrativeSecurityService.validate(request);
        let moduleName = this.validateCoordinates(request, false).moduleName;
        let snapshot = await this.getRepository().getActiveSnapshot(moduleName, request);
        return { code: 'SUC_BOF_00005', data: { snapshot: this.projectSnapshot(snapshot) || null } };
    },
    /** Returns bounded durable contract history for one module. */
    history: async function (request) {
        SERVICE.DefaultBackofficeAdministrativeSecurityService.validate(request);
        let moduleName = this.validateCoordinates(request, false).moduleName;
        let items = await this.getRepository().getHistory(moduleName, Object.assign({}, request, { limit: this.getHistoryLimit(request) }));
        return { code: 'SUC_BOF_00006', data: { moduleName: moduleName, snapshots: items.map(item => this.projectSnapshot(item)) } };
    },
    /** Compares one retained snapshot with the active snapshot using operation identifiers. */
    compare: async function (request) {
        SERVICE.DefaultBackofficeAdministrativeSecurityService.validate(request);
        let params = this.validateCoordinates(request, true);
        let active = await this.getRepository().getActiveSnapshot(params.moduleName, request);
        let candidate = await this.getRepository().getSnapshot(params.moduleName, params.hash, request);
        if (!candidate) throw new CLASSES.NodicsError('ERR_BOF_00000', 'Contract snapshot not found');
        let activeOperations = new Set((active && active.operations || []).map(item => item.operationId));
        let candidateOperations = new Set((candidate.operations || []).map(item => item.operationId));
        return { code: 'SUC_BOF_00007', data: {
            moduleName: params.moduleName, activeHash: active && active.contractHash || null, candidateHash: candidate.contractHash,
            changeClassification: candidate.changeClassification,
            addedOperations: [...candidateOperations].filter(id => !activeOperations.has(id)).sort(),
            removedOperations: [...activeOperations].filter(id => !candidateOperations.has(id)).sort()
        } };
    },
    /** Audits one contract decision using hashes and bounded identity metadata only. */
    auditDecision: function (event) {
        let service = SERVICE.DefaultBackofficeAuditService;
        return service ? service.record(event) : Promise.resolve(false);
    },
    /** Approves a pending candidate with optimistic activation revision. */
    approve: async function (request) {
        SERVICE.DefaultBackofficeAdministrativeSecurityService.validate(request);
        let params = this.validateCoordinates(request, true);
        let decision = this.getDecision(request);
        let result = await this.getRepository().approve(params.moduleName, params.hash, Object.assign({}, request, decision));
        await this.auditDecision(Object.assign({ eventType: 'backoffice.contract.decision', operation: 'approve', outcome: 'approved',
            moduleName: params.moduleName, candidateHash: params.hash }, SERVICE.DefaultBackofficeAdministrativeSecurityService.getAuditContext(request)));
        return { code: 'SUC_BOF_00008', data: { snapshot: this.projectSnapshot(result.snapshot), activation: result.activation } };
    },
    /** Rejects a pending candidate with a required reason. */
    reject: async function (request) {
        SERVICE.DefaultBackofficeAdministrativeSecurityService.validate(request);
        let params = this.validateCoordinates(request, true);
        let decision = this.getDecision(request);
        let snapshot = await this.getRepository().reject(params.moduleName, params.hash, Object.assign({}, request, decision));
        await this.auditDecision(Object.assign({ eventType: 'backoffice.contract.decision', operation: 'reject', outcome: 'rejected',
            moduleName: params.moduleName, candidateHash: params.hash }, SERVICE.DefaultBackofficeAdministrativeSecurityService.getAuditContext(request)));
        return { code: 'SUC_BOF_00009', data: { snapshot: this.projectSnapshot(snapshot) } };
    },
    /** Rolls back the active pointer to one retained safe historical snapshot. */
    rollback: async function (request) {
        SERVICE.DefaultBackofficeAdministrativeSecurityService.validate(request);
        let params = this.validateCoordinates(request, true);
        let decision = this.getDecision(request);
        let result = await this.getRepository().rollback(params.moduleName, params.hash, Object.assign({}, request, decision));
        await this.auditDecision(Object.assign({ eventType: 'backoffice.contract.decision', operation: 'rollback', outcome: 'activated',
            moduleName: params.moduleName, targetHash: params.hash }, SERVICE.DefaultBackofficeAdministrativeSecurityService.getAuditContext(request)));
        return { code: 'SUC_BOF_00010', data: { snapshot: this.projectSnapshot(result.snapshot), activation: result.activation } };
    }
};
