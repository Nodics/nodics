/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module pricing/service/foundation/DefaultPricingEnterpriseScopeService @description Authenticated enterprise isolation and derived Pricing identities. @layer service @owner pricing */
module.exports = {
    /** Executes the init Pricing contract. */
    init: function () { return Promise.resolve(true); },
    /** Executes the postInit Pricing contract. */
    postInit: function () { return Promise.resolve(true); },
    /** Executes the error Pricing contract. */
    error: function (code, message) { return new CLASSES.NodicsError(code, message); },
    /** Executes the configuration Pricing contract. */
    configuration: function () { return CONFIG.get('pricing') || {}; },
    /** Executes the text Pricing contract. */
    text: function (value) { return typeof value === 'string' && value.trim() ? value.trim() : undefined; },
    /** Executes the resolveEnterpriseCode Pricing contract. */
    resolveEnterpriseCode: function (request) {
        let auth = request && request.authData || {}; let enterprise = auth.enterprise && (auth.enterprise.code || auth.enterprise.enterpriseCode);
        let code = this.text(enterprise) || this.text(auth.enterpriseCode) || this.text(auth.entCode);
        if (!code && ((this.configuration().enterpriseScope || {}).required !== false)) throw this.error('ERR_PRICE_00001', 'Authenticated enterprise context is required');
        return code;
    },
    /** Executes the validateBusinessCode Pricing contract. */
    validateBusinessCode: function (value, label) {
        let policy = this.configuration().identity || {}, code = this.text(value), pattern;
        try { pattern = new RegExp(policy.codePattern || '^[A-Za-z0-9][A-Za-z0-9._-]*$'); } catch (error) { throw this.error('ERR_PRICE_00003', 'Pricing identity policy is invalid'); }
        if (!code || code.length > Number(policy.maxCodeLength || 128) || !pattern.test(code)) throw this.error('ERR_PRICE_00003', (label || 'Pricing') + ' code is invalid');
        return code;
    },
    /** Executes the buildIdentity Pricing contract. */
    buildIdentity: function (enterpriseCode, type, parts) {
        let separator = (this.configuration().identity || {}).separator || '::';
        return [this.validateBusinessCode(enterpriseCode, 'Enterprise'), type].concat((parts || []).map((part, index) => this.validateBusinessCode(part, 'Identity part ' + (index + 1)))).join(separator);
    },
    /** Executes the scopeNewModel Pricing contract. */
    scopeNewModel: function (request, type, properties) {
        request = request || {}; request.model = request.model || {}; let enterpriseCode = this.resolveEnterpriseCode(request);
        if (request.model.enterpriseCode && request.model.enterpriseCode !== enterpriseCode) throw this.error('ERR_PRICE_00002', 'Pricing model enterprise does not match authenticated enterprise');
        request.model.enterpriseCode = enterpriseCode; let code = this.buildIdentity(enterpriseCode, type, (properties || []).map(property => request.model[property]));
        if (request.model.code && request.model.code !== code) throw this.error('ERR_PRICE_00006', 'Pricing internal identity is derived');
        request.model.code = code; return request.model;
    },
    /** Executes the scopeQuery Pricing contract. */
    scopeQuery: function (request) {
        request = request || {}; request.query = request.query || {}; let enterpriseCode = this.resolveEnterpriseCode(request);
        if (request.query.enterpriseCode && request.query.enterpriseCode !== enterpriseCode) throw this.error('ERR_PRICE_00002', 'Pricing query enterprise does not match authenticated enterprise');
        request.query.enterpriseCode = enterpriseCode; return Promise.resolve(true);
    }
};
