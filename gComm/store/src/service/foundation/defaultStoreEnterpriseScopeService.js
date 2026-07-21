/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module store/service/foundation/DefaultStoreEnterpriseScopeService
 * @description Resolves authenticated enterprise ownership and scopes Store persistence identities and queries.
 * @layer service
 * @owner store
 * @override Projects may replace claim resolution while preserving fail-closed isolation and deterministic identities.
 */
module.exports = {
    /** Initializes enterprise-scope behavior. */
    init: function () { return Promise.resolve(true); },
    /** Completes enterprise-scope initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Creates a stable Store error. */
    error: function (code, message) { return new CLASSES.NodicsError(code, message); },
    /** Returns effective Store configuration. */
    configuration: function () { return CONFIG.get('store') || {}; },
    /** Normalizes a non-empty string. */
    text: function (value) { return typeof value === 'string' && value.trim() ? value.trim() : undefined; },
    /** Resolves enterprise identity only from authenticated claims. */
    resolveEnterpriseCode: function (request) {
        let auth = request && request.authData || {};
        let enterprise = auth.enterprise && (auth.enterprise.code || auth.enterprise.enterpriseCode);
        let code = this.text(enterprise) || this.text(auth.enterpriseCode) || this.text(auth.entCode);
        if (!code && ((this.configuration().enterpriseScope || {}).required !== false)) {
            throw this.error('ERR_STORE_00001', 'Authenticated enterprise context is required for store operations');
        }
        return code;
    },
    /** Validates one configured business-code component. */
    validateBusinessCode: function (value, label) {
        let policy = this.configuration().identity || {}; let code = this.text(value); let pattern;
        try { pattern = new RegExp(policy.codePattern || '^[A-Za-z0-9][A-Za-z0-9._-]*$'); } catch (error) {
            throw this.error('ERR_STORE_00003', 'Store identity policy is invalid');
        }
        if (!code || code.length > Number(policy.maxCodeLength || 128) || !pattern.test(code)) {
            throw this.error('ERR_STORE_00003', (label || 'Store') + ' code is invalid');
        }
        return code;
    },
    /** Builds a deterministic internal identity. */
    buildIdentity: function (enterpriseCode, type, parts) {
        let separator = (this.configuration().identity || {}).separator || '::';
        return [this.validateBusinessCode(enterpriseCode, 'Enterprise'), type]
            .concat((parts || []).map((value, index) => this.validateBusinessCode(value, 'Identity part ' + (index + 1))))
            .join(separator);
    },
    /** Applies enterprise ownership and derived identity to a new model. */
    scopeNewModel: function (request, type, identityProperties) {
        request = request || {}; request.model = request.model || {};
        let enterpriseCode = this.resolveEnterpriseCode(request);
        if (request.model.enterpriseCode && request.model.enterpriseCode !== enterpriseCode) {
            throw this.error('ERR_STORE_00002', 'Store model enterprise does not match the authenticated enterprise');
        }
        request.model.enterpriseCode = enterpriseCode;
        let code = this.buildIdentity(enterpriseCode, type, (identityProperties || []).map(property => request.model[property]));
        if (request.model.code && request.model.code !== code) {
            throw this.error('ERR_STORE_00006', 'Store internal identity is derived and cannot be supplied with another value');
        }
        request.model.code = code; return request.model;
    },
    /** Restricts one generated persistence query to the authenticated enterprise. */
    scopeQuery: function (request) {
        request = request || {}; request.query = request.query || {};
        let enterpriseCode = this.resolveEnterpriseCode(request);
        if (request.query.enterpriseCode && request.query.enterpriseCode !== enterpriseCode) {
            throw this.error('ERR_STORE_00002', 'Store query enterprise does not match the authenticated enterprise');
        }
        request.query.enterpriseCode = enterpriseCode; return Promise.resolve(true);
    }
};
