/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nPublish/service/DefaultPublicationLifecycleService
 * @description Orchestrates the provider-neutral publication lifecycle with governed transitions, CAS revisions, audit, activation, and rollback.
 * @layer service
 * @owner nPublish
 * @override Later modules may replace providers or orchestration while preserving lifecycle, audit, idempotency, tenant, and rollback contracts.
 */
module.exports = {
    /** Initializes publication lifecycle orchestration. */
    init: function () { return Promise.resolve(true); },
    /** Completes publication lifecycle initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns the effective layered publish configuration. */
    getConfiguration: function () { return CONFIG.get('publish') || {}; },
    /** Resolves a provider object or named Nodics service. */
    resolveProvider: function (reference) {
        if (reference && typeof reference === 'object') return reference;
        return reference && SERVICE[reference];
    },
    /** Resolves the configured publication repository. */
    getRepository: function () {
        let provider = this.resolveProvider((this.getConfiguration().providers || {}).repositoryProvider);
        if (!provider) throw new CLASSES.NodicsError('ERR_PUB_00001', 'Publication repository provider is unavailable');
        return provider;
    },
    /** Resolves the configured immutable version provider. */
    getVersionProvider: function (domain) {
        let providers = this.getConfiguration().providers || {};
        let provider = this.resolveProvider((providers.versionProviders || {})[domain] || providers.versionProvider);
        if (!provider) throw new CLASSES.NodicsError('ERR_PUB_00001', 'Publication version provider is unavailable');
        return provider;
    },
    /** Resolves the configured adapter for one business domain. */
    getDomainAdapter: function (domain) {
        let reference = ((this.getConfiguration().providers || {}).domainAdapters || {})[domain];
        let provider = this.resolveProvider(reference);
        if (!provider) throw new CLASSES.NodicsError('ERR_PUB_00002', 'Publication domain adapter is unavailable: ' + domain);
        return provider;
    },
    /** Resolves a safe actor identifier from authenticated context. */
    getActor: function (request) {
        let auth = request && request.authData || {};
        return String(auth.principalId || auth.code || auth.loginId || 'system');
    },
    /** Validates and returns the expected optimistic revision. */
    requireExpectedRevision: function (request, publication) {
        let expected = request && request.expectedRevision;
        if ((this.getConfiguration().lifecycle || {}).requireExpectedRevision !== false && expected === undefined) {
            throw new CLASSES.NodicsError('ERR_PUB_00004', 'Expected publication revision is required');
        }
        if (expected !== undefined && Number(expected) !== Number(publication.revision || 0)) {
            throw new CLASSES.NodicsError('ERR_PUB_00004', 'Publication revision conflict');
        }
        return Number(publication.revision || 0);
    },
    /** Verifies that a configured lifecycle transition is permitted. */
    assertTransition: function (fromState, toState) {
        let transitions = (this.getConfiguration().lifecycle || {}).transitions || {};
        if (!Array.isArray(transitions[fromState]) || !transitions[fromState].includes(toState)) {
            throw new CLASSES.NodicsError('ERR_PUB_00005', 'Invalid publication transition: ' + fromState + ' -> ' + toState);
        }
    },
    /** Produces bounded audit evidence without credential-like fields. */
    sanitizeEvidence: function (value) {
        if (value === undefined || value === null) return value;
        if (Array.isArray(value)) return value.slice(0, 100).map(item => this.sanitizeEvidence(item));
        if (typeof value !== 'object') return typeof value === 'string' ? value.slice(0, 1000) : value;
        let output = {};
        Object.keys(value).slice(0, 100).forEach(key => {
            if (!/authorization|token|secret|password|credential/i.test(key)) output[key] = this.sanitizeEvidence(value[key]);
        });
        return output;
    },
    /** Persists one governed transition and its immutable audit evidence. */
    transition: async function (publication, toState, request, patch, evidence) {
        this.assertTransition(publication.state, toState);
        let expected = this.requireExpectedRevision(request, publication);
        let audit = { publicationCode: publication.code, fromState: publication.state,
            toState: toState, actor: this.getActor(request), reason: request && request.reason,
            details: this.sanitizeEvidence(evidence), correlationId: request && (request.correlationId || request.requestId) };
        return this.getRepository().transitionWithAudit(publication, expected,
            Object.assign({}, patch || {}, { state: toState, updatedBy: this.getActor(request) }), audit, request);
    },
    /** Creates an idempotent staged publication request. */
    create: async function (request) {
        let input = request && request.publication || {};
        ['code', 'domain', 'rootType', 'rootCode', 'sourceVersion'].forEach(field => {
            if (!input[field]) throw new CLASSES.NodicsError('ERR_PUB_00000', 'Publication ' + field + ' is required');
        });
        this.getDomainAdapter(input.domain);
        let actor = this.getActor(request);
        let initialState = (this.getConfiguration().lifecycle || {}).initialState || 'STAGED';
        let model = Object.assign({}, input, { active: true,
            state: initialState, revision: 0, requestedBy: actor, correlationId: request.correlationId || request.requestId,
            auditTrail: [{ publicationCode: input.code, toState: initialState, revision: 0,
                actor: actor, reason: request.reason, correlationId: request.correlationId || request.requestId }] });
        let created = await this.getRepository().create(model, request);
        if (Number(created.revision || 0) === 0) await this.getRepository().appendAudit(created.auditTrail[0], request).catch(() => false);
        return created;
    },
    /** Resolves dependencies and validates the immutable staged version. */
    validate: async function (request) {
        let publication = await this.getRepository().get(request.publicationCode, request);
        if (!publication) throw new CLASSES.NodicsError('ERR_PUB_00000', 'Publication request was not found');
        if (publication.state === 'VALIDATED') return publication;
        if (publication.state !== 'VALIDATING') publication = await this.transition(publication, 'VALIDATING', request);
        try {
            let adapter = this.getDomainAdapter(publication.domain);
            let provider = this.getVersionProvider(publication.domain);
            let version = await provider.getVersion(publication, request);
            let dependencies = adapter.resolveDependencies ? await adapter.resolveDependencies(publication, version, request) : [];
            let configuredMax = (this.getConfiguration().lifecycle || {}).maxDependencies;
            let max = configuredMax === undefined ? 10000 : Number(configuredMax);
            if (!Array.isArray(dependencies) || dependencies.length > max) throw new CLASSES.NodicsError('ERR_PUB_00006', 'Publication dependency boundary exceeded');
            let validation = adapter.validate ? await adapter.validate(publication, version, request, dependencies) : { valid: true };
            if (!validation || validation.valid !== true) throw new CLASSES.NodicsError('ERR_PUB_00006', 'Publication validation failed');
            return await this.transition(publication, 'VALIDATED', Object.assign({}, request, { expectedRevision: publication.revision }),
                { dependencies: dependencies, validation: this.sanitizeEvidence(validation) }, validation);
        } catch (error) {
            await this.transition(publication, 'FAILED', Object.assign({}, request, { expectedRevision: publication.revision }), {},
                { failureCode: error.code || error.name || 'VALIDATION_FAILED' }).catch(() => false);
            throw error;
        }
    },
    /** Moves a validated publication into governed approval. */
    requestApproval: async function (request) {
        let publication = await this.getRepository().get(request.publicationCode, request);
        let updated = publication && publication.state === 'PENDING_APPROVAL' ? publication :
            await this.transition(publication, 'PENDING_APPROVAL', request);
        let workflow = this.resolveProvider((this.getConfiguration().providers || {}).workflowProvider);
        if (workflow && workflow.requestApproval) await workflow.requestApproval(updated, request);
        return updated;
    },
    /** Records approval for a pending publication. */
    approve: async function (request) {
        let publication = await this.getRepository().get(request.publicationCode, request);
        if (publication && publication.state === 'APPROVED') return publication;
        return this.transition(publication, 'APPROVED', request);
    },
    /** Records rejection for a pending publication. */
    reject: async function (request) {
        let publication = await this.getRepository().get(request.publicationCode, request);
        if (publication && publication.state === 'REJECTED') return publication;
        return this.transition(publication, 'REJECTED', request);
    },
    /** Resumes an already-approved domain workflow release idempotently through validation and Online activation. */
    publishApproved: async function (request) {
        let publication = await this.create(request);
        let context = Object.assign({}, request, { publicationCode: publication.code });
        if (publication.state === 'ONLINE') return publication;
        if (publication.state === 'STAGED' || publication.state === 'VALIDATING') {
            publication = await this.validate(Object.assign({}, context, { expectedRevision: publication.revision }));
        }
        if (publication.state === 'VALIDATED' || publication.state === 'PENDING_APPROVAL') {
            publication = await this.approve(Object.assign({}, context, { expectedRevision: publication.revision }));
        }
        if (publication.state === 'APPROVED' || publication.state === 'ACTIVATING') {
            publication = await this.activate(Object.assign({}, context, { expectedRevision: publication.revision }));
        }
        if (publication.state !== 'ONLINE') {
            throw new CLASSES.NodicsError('ERR_PUB_00005', 'Approved publication cannot resume from state: ' + publication.state);
        }
        return publication;
    },
    /** Activates an approved source version and records the previous Online version. */
    activate: async function (request) {
        let publication = await this.getRepository().get(request.publicationCode, request);
        if (publication && publication.state === 'ONLINE') return publication;
        if (publication.state !== 'ACTIVATING') publication = await this.transition(publication, 'ACTIVATING', request);
        try {
            let provider = this.getVersionProvider(publication.domain);
            let previous = provider.getOnlineVersion ? await provider.getOnlineVersion(publication, request) : null;
            let activation = await provider.activate(publication, request);
            let adapter = this.getDomainAdapter(publication.domain);
            if (adapter.afterActivate) await adapter.afterActivate(publication, activation, request);
            let patch = { targetVersion: activation && activation.version || publication.sourceVersion };
            let previousOnlineVersion = previous && (previous.version || previous);
            if (previousOnlineVersion) patch.previousOnlineVersion = previousOnlineVersion;
            return await this.transition(publication, 'ONLINE', Object.assign({}, request, { expectedRevision: publication.revision }),
                patch, activation);
        } catch (error) {
            await this.transition(publication, 'FAILED', Object.assign({}, request, { expectedRevision: publication.revision }), {},
                { failureCode: error.code || error.name || 'ACTIVATION_FAILED' }).catch(() => false);
            throw error;
        }
    },
    /** Restores the captured previous Online version idempotently. */
    rollback: async function (request) {
        let publication = await this.getRepository().get(request.publicationCode, request);
        if (publication && publication.state === 'ROLLED_BACK') return publication;
        if (publication.state !== 'ROLLING_BACK') publication = await this.transition(publication, 'ROLLING_BACK', request);
        try {
            let result = await this.getVersionProvider(publication.domain).rollback(publication, publication.previousOnlineVersion, request);
            let adapter = this.getDomainAdapter(publication.domain);
            if (adapter.afterRollback) await adapter.afterRollback(publication, result, request);
            return await this.transition(publication, 'ROLLED_BACK', Object.assign({}, request, { expectedRevision: publication.revision }), {}, result);
        } catch (error) {
            await this.transition(publication, 'FAILED', Object.assign({}, request, { expectedRevision: publication.revision }), {},
                { failureCode: error.code || error.name || 'ROLLBACK_FAILED' }).catch(() => false);
            throw error;
        }
    }
};
