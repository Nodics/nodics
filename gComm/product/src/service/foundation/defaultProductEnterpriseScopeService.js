/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module product/foundation/DefaultProductEnterpriseScopeService @description Enforces authenticated enterprise ownership and derives Product persistence identities. @layer service @owner product */
module.exports = {
    /** Initializes enterprise scoping. */ init: function () { return Promise.resolve(true); },
    /** Completes enterprise-scope initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Creates a stable Product error. */ error: function (code, message) { return new CLASSES.NodicsError(code, message); },
    /** Returns layered Product configuration. */ configuration: function () { return CONFIG.get('product') || {}; },
    /** Normalizes a non-empty string. */ text: function (value) { return typeof value === 'string' && value.trim() ? value.trim() : undefined; },
    /** Resolves enterprise ownership only from trusted authentication context. */ resolveEnterpriseCode: function (request) {
        let auth = request && request.authData || {}, enterprise = auth.enterprise && (auth.enterprise.code || auth.enterprise.enterpriseCode);
        let code = this.text(enterprise) || this.text(auth.enterpriseCode) || this.text(auth.entCode);
        if (!code && ((this.configuration().enterpriseScope || {}).required !== false)) throw this.error('ERR_PRODUCT_00001', 'Authenticated enterprise context is required');
        return code;
    },
    /** Validates a configurable business-code boundary. */ validateBusinessCode: function (value, label) {
        let policy = this.configuration().identity || {}, code = this.text(value), pattern;
        try { pattern = new RegExp(policy.codePattern || '^[A-Za-z0-9][A-Za-z0-9._-]*$'); } catch (error) { throw this.error('ERR_PRODUCT_00003', 'Product identity policy is invalid'); }
        if (!code || code.length > Number(policy.maxCodeLength || 128) || !pattern.test(code)) throw this.error('ERR_PRODUCT_00003', (label || 'Product') + ' code is invalid');
        return code;
    },
    /** Builds a deterministic internal identity from trusted scope and business keys. */ buildIdentity: function (enterpriseCode, type, parts) {
        let separator = (this.configuration().identity || {}).separator || '::';
        return [this.validateBusinessCode(enterpriseCode, 'Enterprise'), type].concat((parts || []).map((part, index) => this.validateBusinessCode(part, 'Identity part ' + (index + 1)))).join(separator);
    },
    /** Applies enterprise scope and a derived identity to a new record. */ scopeNewModel: function (request, type, properties) {
        request = request || {}; request.model = request.model || {}; let enterpriseCode = this.resolveEnterpriseCode(request);
        if (request.model.enterpriseCode && request.model.enterpriseCode !== enterpriseCode) throw this.error('ERR_PRODUCT_00002', 'Product model enterprise does not match authenticated enterprise');
        request.model.enterpriseCode = enterpriseCode;
        let code = this.buildIdentity(enterpriseCode, type, (properties || []).map(property => request.model[property]));
        if (request.model.code && request.model.code !== code) throw this.error('ERR_PRODUCT_00004', 'Product internal identity is derived');
        request.model.code = code; return request.model;
    },
    /** Adds authenticated enterprise scope to a persistence query. */ scopeQuery: function (request) {
        request = request || {}; request.query = request.query || {}; let enterpriseCode = this.resolveEnterpriseCode(request);
        if (request.query.enterpriseCode && request.query.enterpriseCode !== enterpriseCode) throw this.error('ERR_PRODUCT_00002', 'Product query enterprise does not match authenticated enterprise');
        request.query.enterpriseCode = enterpriseCode; return Promise.resolve(true);
    }
};
