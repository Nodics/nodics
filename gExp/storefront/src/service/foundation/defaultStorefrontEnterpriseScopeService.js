/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module storefront/service/foundation/DefaultStorefrontEnterpriseScopeService
 * @description Enforces authenticated enterprise ownership and deterministic Storefront identities.
 * @layer service
 * @owner storefront
 * @override Projects may map different authenticated enterprise claims while preserving fail-closed isolation.
 */
module.exports = {
    /** Initializes authenticated enterprise scoping. */
    init: function () {
        return Promise.resolve(true);
    },
    /** Completes enterprise scope initialization. */
    postInit: function () {
        return Promise.resolve(true);
    },
    /** Creates a stable Storefront error. */
    error: function (code, message) {
        return new CLASSES.NodicsError(code, message);
    },
    /** Returns effective Storefront configuration. */
    configuration: function () {
        return CONFIG.get('storefront') || {};
    },
    /** Normalizes a non-empty text value. */
    text: function (value) {
        return typeof value === 'string' && value.trim() ? value.trim() : undefined;
    },
    /** Resolves enterprise ownership only from authenticated claims. */
    resolveEnterpriseCode: function (request) {
        let auth = (request && request.authData) || {},
            enterprise = auth.enterprise && (auth.enterprise.code || auth.enterprise.enterpriseCode),
            code = this.text(enterprise) || this.text(auth.enterpriseCode) || this.text(auth.entCode);
        if (!code && (this.configuration().enterpriseScope || {}).required !== false)
            throw this.error('ERR_STOREFRONT_00001', 'Authenticated enterprise context is required');
        return code;
    },
    /** Validates one configured business-code component. */
    validateBusinessCode: function (value, label) {
        let policy = this.configuration().identity || {},
            code = this.text(value),
            pattern;
        try {
            pattern = new RegExp(policy.codePattern || '^[A-Za-z0-9][A-Za-z0-9._-]*$');
        } catch (error) {
            throw this.error('ERR_STOREFRONT_00003', 'Storefront identity policy is invalid');
        }
        if (!code || code.length > Number(policy.maxCodeLength || 128) || !pattern.test(code))
            throw this.error('ERR_STOREFRONT_00003', (label || 'Business') + ' code is invalid');
        return code;
    },
    /** Builds a deterministic enterprise-owned internal identity. */
    buildIdentity: function (enterpriseCode, type, values) {
        let separator = (this.configuration().identity || {}).separator || '::';
        return [this.validateBusinessCode(enterpriseCode, 'Enterprise'), type]
            .concat((values || []).map((value) => this.validateBusinessCode(value, 'Identity')))
            .join(separator);
    },
    /** Applies authenticated enterprise ownership to a new model. */
    scopeNewModel: function (request, type, identityProperties) {
        request.model = request.model || {};
        let enterpriseCode = this.resolveEnterpriseCode(request);
        if (request.model.enterpriseCode && request.model.enterpriseCode !== enterpriseCode)
            throw this.error('ERR_STOREFRONT_00002', 'Model enterprise does not match authenticated enterprise');
        request.model.enterpriseCode = enterpriseCode;
        let code = this.buildIdentity(
            enterpriseCode,
            type,
            identityProperties.map((property) => request.model[property])
        );
        if (request.model.code && request.model.code !== code)
            throw this.error('ERR_STOREFRONT_00006', 'Internal identity is derived');
        request.model.code = code;
        return request.model;
    },
    /** Restricts a persistence query to the authenticated enterprise. */
    scopeQuery: function (request) {
        request.query = request.query || {};
        let enterpriseCode = this.resolveEnterpriseCode(request);
        if (request.query.enterpriseCode && request.query.enterpriseCode !== enterpriseCode)
            throw this.error('ERR_STOREFRONT_00002', 'Query enterprise does not match authenticated enterprise');
        request.query.enterpriseCode = enterpriseCode;
        return Promise.resolve(true);
    }
};
