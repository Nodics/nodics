/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nPublish/service/DefaultPublicationRepositoryService
 * @description Persists publication requests with an atomic transition journal and projects audits through generated schema services.
 * @layer service
 * @owner nPublish
 * @override Projects may replace persistence while preserving tenant isolation, compare-and-set transitions, and immutable audit semantics.
 */
module.exports = {
    /** Initializes publication persistence. */
    init: function () { return Promise.resolve(true); },
    /** Completes publication persistence initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Resolves the tenant for a persistence request. */
    getTenant: function (request) { return request && request.tenant || CONFIG.get('defaultTenant') || 'default'; },
    /** Resolves generated publication request and audit services. */
    getServices: function () {
        let publication = SERVICE.DefaultPublicationRequestService;
        let audit = SERVICE.DefaultPublicationAuditService;
        if (!publication || !audit) throw new CLASSES.NodicsError('ERR_PUB_00001', 'Publication persistence services are unavailable');
        return { publication: publication, audit: audit };
    },
    /** Extracts generated-service result items. */
    getItems: function (response) { return response && Array.isArray(response.result) ? response.result : []; },
    /** Extracts a provider-neutral affected-record count. */
    getAffectedCount: function (response) {
        let result = response && response.result !== undefined ? response.result : response;
        if (!result) return 0;
        if (typeof result.modifiedCount === 'number') return result.modifiedCount;
        if (typeof result.nModified === 'number') return result.nModified;
        if (typeof result.n === 'number') return result.n;
        return result.result ? this.getAffectedCount(result.result) : 0;
    },
    /** Loads one tenant-scoped publication request by code. */
    get: async function (code, request) {
        let response = await this.getServices().publication.get({ tenant: this.getTenant(request), authData: request && request.authData,
            query: { code: code }, searchOptions: { limit: 1 } });
        return this.getItems(response)[0];
    },
    /** Lists one bounded tenant-scoped batch of publication requests for projection reconciliation. */
    list: async function (request, limit) {
        let response = await this.getServices().publication.get({ tenant: this.getTenant(request), authData: request && request.authData,
            query: request && request.publicationCode ? { code: request.publicationCode } : { active: true },
            searchOptions: { limit: Number(limit) } });
        return this.getItems(response);
    },
    /** Returns deterministic audit projection codes already stored for one publication. */
    getAuditCodes: async function (publicationCode, request) {
        let response = await this.getServices().audit.get({ tenant: this.getTenant(request), authData: request && request.authData,
            query: { publicationCode: publicationCode }, searchOptions: {} });
        return new Set(this.getItems(response).map(item => item.code ||
            (item.publicationCode + '_' + item.revision + '_' + item.toState)));
    },
    /** Creates a publication request idempotently for the same immutable identity. */
    create: async function (model, request) {
        let existing = await this.get(model.code, request);
        if (existing) {
            if (existing.domain === model.domain && existing.rootType === model.rootType &&
                existing.rootCode === model.rootCode && existing.sourceVersion === model.sourceVersion) return existing;
            throw new CLASSES.NodicsError('ERR_PUB_00003', 'Publication code already belongs to another request');
        }
        try {
            let response = await this.getServices().publication.save({ tenant: this.getTenant(request), authData: request && request.authData, model: model });
            return this.getItems(response)[0] || response.result || model;
        } catch (error) {
            existing = await this.get(model.code, request);
            if (existing && existing.domain === model.domain && existing.rootType === model.rootType &&
                existing.rootCode === model.rootCode && existing.sourceVersion === model.sourceVersion) return existing;
            throw error;
        }
    },
    /** Applies one compare-and-set publication state update. */
    transition: async function (publication, expectedRevision, patch, request) {
        let next = Object.assign({}, patch, { revision: Number(publication.revision || 0) + 1 });
        let response = await this.getServices().publication.update({ tenant: this.getTenant(request), authData: request && request.authData,
            query: { code: publication.code, revision: Number(expectedRevision) }, model: next });
        if (this.getAffectedCount(response) !== 1) throw new CLASSES.NodicsError('ERR_PUB_00004', 'Publication revision conflict');
        return Object.assign({}, publication, next);
    },
    /** Atomically applies a state transition, revision, and authoritative immutable audit journal entry. */
    transitionWithAudit: async function (publication, expectedRevision, patch, audit, request) {
        let entry = Object.assign({}, audit, { revision: Number(publication.revision || 0) + 1 });
        let trail = [].concat(publication.auditTrail || [], [entry]);
        let updated = await this.transition(publication, expectedRevision,
            Object.assign({}, patch, { auditTrail: trail }), request);
        try {
            await this.appendAudit(entry, request);
        } catch (error) {
            if (this.LOG && this.LOG.warn) this.LOG.warn('Publication audit projection failed for ' + publication.code + ': ' + error.message);
        }
        return updated;
    },
    /** Appends one deterministic immutable transition audit entry. */
    appendAudit: async function (audit, request) {
        let model = Object.assign({ active: true }, audit, {
            code: audit.publicationCode + '_' + audit.revision + '_' + audit.toState
        });
        try {
            await this.getServices().audit.save({ tenant: this.getTenant(request), authData: request && request.authData, model: model });
        } catch (error) {
            let response = await this.getServices().audit.get({ tenant: this.getTenant(request), authData: request && request.authData,
                query: { code: model.code }, searchOptions: { limit: 1 } });
            if (!this.getItems(response)[0]) throw error;
        }
        return model;
    }
};
