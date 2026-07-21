/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module inventory/service/foundation/DefaultInventoryEnterpriseScopeService
 * @description Resolves authenticated enterprise ownership, creates stable internal identities, and scopes every generated persistence query.
 * @layer service
 * @owner inventory
 * @override Projects may replace enterprise claim resolution while preserving fail-closed isolation and deterministic identities.
 */
module.exports = {
    /** Initializes the enterprise-scope service. */
    init: function () { return Promise.resolve(true); },
    /** Completes enterprise-scope service initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Creates a stable inventory error without leaking request details. */
    error: function (code, message) { return new CLASSES.NodicsError(code, message); },
    /** Returns the effective inventory configuration. */
    configuration: function () { return CONFIG.get('inventory') || {}; },
    /** Returns a trimmed non-empty string or undefined. */
    text: function (value) {
        return typeof value === 'string' && value.trim() ? value.trim() : undefined;
    },
    /** Resolves enterprise identity only from authenticated claims. */
    resolveEnterpriseCode: function (request) {
        let auth = request && request.authData || {};
        let enterprise = auth.enterprise && (auth.enterprise.code || auth.enterprise.enterpriseCode);
        let code = this.text(enterprise) || this.text(auth.enterpriseCode) || this.text(auth.entCode);
        if (!code && ((this.configuration().enterpriseScope || {}).required !== false)) {
            throw this.error('ERR_INV_00001', 'Authenticated enterprise context is required for inventory operations');
        }
        return code;
    },
    /** Validates one configurable business identity component. */
    validateBusinessCode: function (value, label) {
        let policy = this.configuration().identity || {};
        let code = this.text(value);
        let pattern;
        try { pattern = new RegExp(policy.codePattern || '^[A-Za-z0-9][A-Za-z0-9._-]*$'); } catch (error) {
            throw this.error('ERR_INV_00003', 'Inventory identity policy is invalid');
        }
        if (!code || code.length > Number(policy.maxCodeLength || 128) || !pattern.test(code)) {
            throw this.error('ERR_INV_00003', (label || 'Inventory') + ' code is invalid');
        }
        return code;
    },
    /** Creates the internal tenant-local primary code from authoritative business identity components. */
    buildIdentity: function (enterpriseCode, type, parts) {
        let policy = this.configuration().identity || {};
        let separator = policy.separator || '::';
        let values = [this.validateBusinessCode(enterpriseCode, 'Enterprise'), type]
            .concat((parts || []).map((value, index) => this.validateBusinessCode(value, 'Identity part ' + (index + 1))));
        return values.join(separator);
    },
    /** Applies authenticated enterprise ownership and deterministic primary identity to a new model. */
    scopeNewModel: function (request, type, identityProperties) {
        request = request || {};
        request.model = request.model || {};
        let enterpriseCode = this.resolveEnterpriseCode(request);
        if (request.model.enterpriseCode && request.model.enterpriseCode !== enterpriseCode) {
            throw this.error('ERR_INV_00002', 'Inventory model enterprise does not match the authenticated enterprise');
        }
        request.model.enterpriseCode = enterpriseCode;
        let parts = (identityProperties || []).map(property => request.model[property]);
        let code = this.buildIdentity(enterpriseCode, type, parts);
        if (request.model.code && request.model.code !== code) {
            throw this.error('ERR_INV_00006', 'Inventory internal identity is derived and cannot be supplied with another value');
        }
        request.model.code = code;
        return request.model;
    },
    /** Restricts a generated get/update/remove query to the authenticated enterprise. */
    scopeQuery: function (request) {
        request = request || {};
        request.query = request.query || {};
        let enterpriseCode = this.resolveEnterpriseCode(request);
        if (request.query.enterpriseCode && request.query.enterpriseCode !== enterpriseCode) {
            throw this.error('ERR_INV_00002', 'Inventory query enterprise does not match the authenticated enterprise');
        }
        request.query.enterpriseCode = enterpriseCode;
        return Promise.resolve(true);
    }
};
