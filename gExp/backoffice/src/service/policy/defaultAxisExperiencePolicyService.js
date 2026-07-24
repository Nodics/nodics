/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module backoffice/service/policy/DefaultAxisExperiencePolicyService
 * @description Resolves and revision-updates the tenant-scoped persistent policy consumed by authenticated Nodics Axis clients.
 * @layer service
 * @owner backoffice
 * @override Projects may replace persistence while preserving validation, tenant isolation, optimistic concurrency, audit, and client-safe projection.
 */
module.exports = {
    /** Initializes the Axis policy service. */
    init: function () { return Promise.resolve(true); },
    /** Completes Axis policy service initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns the layered defaults and validation bounds for Axis policy. */
    getConfiguration: function () { return CONFIG.get('backofficeAxisPolicy') || {}; },
    /** Resolves the tenant without accepting a client-supplied cross-tenant override. */
    getTenant: function (request) { return request && request.tenant || CONFIG.get('defaultTenant') || 'default'; },
    /** Returns a governed internal identity for private generated-schema persistence calls. */
    getPersistenceAuthData: function (request) {
        let identity = SERVICE.DefaultIdentityGovernanceService;
        return identity && typeof identity.getSystemAuthData === 'function' ? identity.getSystemAuthData() : request && request.authData;
    },
    /** Returns the private generated schema service. */
    getStore: function () {
        if (!SERVICE.DefaultBackofficeAxisPolicyService) throw new Error('BackOffice Axis policy persistence service is unavailable');
        return SERVICE.DefaultBackofficeAxisPolicyService;
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
    /** Returns and validates the fixed policy code. */
    getCode: function () {
        let code = String(this.getConfiguration().code || 'axisEmployeeExperiencePolicy');
        if (!/^[A-Za-z][A-Za-z0-9_-]{0,127}$/.test(code)) throw new Error('BackOffice Axis policy code is invalid');
        return code;
    },
    /** Validates and normalizes one supported policy value set. */
    normalize: function (policy) {
        let configuration = this.getConfiguration();
        let minimum = Number(configuration.minimumIdleTimeoutSeconds || 60);
        let maximum = Number(configuration.maximumIdleTimeoutSeconds || 86400);
        let timeout = Number(policy.idleTimeoutSeconds);
        if (typeof policy.screenLockEnabled !== 'boolean' || !Number.isInteger(timeout) || timeout < minimum || timeout > maximum) {
            throw new CLASSES.NodicsError('ERR_BOF_00000', 'Invalid Axis employee screen-lock policy');
        }
        return {
            contractVersion: Number(configuration.contractVersion || 1),
            screenLockEnabled: policy.screenLockEnabled,
            idleTimeoutSeconds: timeout
        };
    },
    /** Returns the configured fail-safe policy when no persistent override exists. */
    getDefaultPolicy: function () {
        let configuration = this.getConfiguration();
        return Object.assign(this.normalize({
            screenLockEnabled: configuration.screenLockEnabled !== false,
            idleTimeoutSeconds: Number(configuration.idleTimeoutSeconds || 900)
        }), { revision: 0, source: 'DEFAULT' });
    },
    /** Loads the tenant-scoped persistent policy or the safe layered default. */
    getEffective: async function (request) {
        let response;
        try {
            response = await this.getStore().get({
                tenant: this.getTenant(request),
                authData: this.getPersistenceAuthData(request),
                query: { code: this.getCode() },
                searchOptions: { limit: 1 }
            });
        } catch (error) {
            if (this.LOG && this.LOG.error) this.LOG.error('BackOffice Axis policy persistence read failed', error);
            return this.getDefaultPolicy();
        }
        let persisted = this.getItems(response)[0];
        if (!persisted) return this.getDefaultPolicy();
        return Object.assign(this.normalize(persisted), {
            revision: Number(persisted.revision || 1),
            source: 'PERSISTED'
        });
    },
    /** Returns the effective client-safe policy envelope for an authenticated employee. */
    get: async function (request) {
        return { code: 'SUC_BOF_00015', data: await this.getEffective(request) };
    },
    /** Creates or compare-and-set updates the tenant-scoped persistent policy. */
    update: async function (request) {
        let requested = request && request.body || {};
        let next = this.normalize(requested);
        let expectedRevision = Number(requested.expectedRevision);
        if (!Number.isInteger(expectedRevision) || expectedRevision < 0) {
            throw new CLASSES.NodicsError('ERR_BOF_00000', 'Axis policy expectedRevision must be a non-negative integer');
        }
        let current = await this.getEffective(request);
        if (expectedRevision !== Number(current.revision)) {
            throw new CLASSES.NodicsError('ERR_BOF_00000', 'Axis policy revision conflict');
        }
        let authData = request && request.authData || {};
        let actor = String(authData.principalId || authData.loginId || authData.code || '');
        if (!actor || authData.tokenType === 'service') throw new CLASSES.NodicsError('ERR_AUTH_00003', 'A human employee principal is required');
        let model = Object.assign({}, next, {
            revision: expectedRevision + 1,
            updatedAt: new Date(),
            updatedBy: actor
        });
        let store = this.getStore();
        let persistenceRequest = {
            tenant: this.getTenant(request),
            authData: this.getPersistenceAuthData(request)
        };
        if (expectedRevision === 0) {
            await store.save(Object.assign({}, persistenceRequest, {
                model: Object.assign({ code: this.getCode(), active: true }, model)
            }));
        } else {
            let response = await store.update(Object.assign({}, persistenceRequest, {
                query: { code: this.getCode(), revision: expectedRevision },
                model: model
            }));
            if (this.getAffectedCount(response) !== 1) throw new CLASSES.NodicsError('ERR_BOF_00000', 'Axis policy revision conflict');
        }
        if (SERVICE.DefaultBackofficeAuditService) {
            await SERVICE.DefaultBackofficeAuditService.record({
                eventType: 'backoffice.axis.policy.updated',
                outcome: 'completed',
                principalId: actor,
                revision: model.revision
            });
        }
        return { code: 'SUC_BOF_00016', data: Object.assign({}, next, { revision: model.revision, source: 'PERSISTED' }) };
    }
};
