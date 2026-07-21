/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module units/service/foundation/DefaultUnitsDefinitionService
 * @description Enforces configurable identity, scope, dimension-vector, regional conversion, and no-hard-delete foundation rules.
 * @layer service
 * @owner units
 * @override Projects may extend classifications while preserving exact factors, scoped identity, and deterministic regional meaning.
 */
module.exports = {
    /** Initializes definition validation. */ init: function () { return Promise.resolve(true); },
    /** Completes definition validation initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Returns effective Units configuration. */ policy: function () { return CONFIG.get('units') || {}; },
    /** Creates a stable Units error. */ error: function (code, message) { return new CLASSES.NodicsError(code, message); },
    /** Validates and normalizes one business code. */
    code: function (value, label) {
        let config = this.policy().identity || {}; let text = typeof value === 'string' ? value.trim() : '';
        let pattern = new RegExp(config.codePattern || '^[A-Za-z0-9][A-Za-z0-9._-]*$');
        if (!text || text.length > Number(config.maxCodeLength || 128) || !pattern.test(text)) throw this.error('ERR_UNIT_00002', (label || 'Units') + ' code is invalid');
        return text;
    },
    /** Validates a dimension vector with finite integer exponents. */
    vector: function (value) {
        if (!value || !Object.keys(value).length || Object.keys(value).some(key => !this.code(key, 'Dimension vector') || !Number.isInteger(Number(value[key])))) {
            throw this.error('ERR_UNIT_00002', 'Dimension vector requires integer exponents');
        }
        return value;
    },
    /** Applies GLOBAL or authenticated ENTERPRISE ownership and a derived primary identity. */
    identity: function (request, type, businessCode) {
        request.model = request.model || {}; let model = request.model; let scopeType = model.scopeType || 'GLOBAL';
        if (!(this.policy().scopeTypes || []).includes(scopeType)) throw this.error('ERR_UNIT_00002', 'Units scope type is invalid');
        let enterpriseCode;
        if (scopeType === 'ENTERPRISE') {
            let auth = request.authData || {}; enterpriseCode = auth.entCode || auth.enterpriseCode || auth.enterprise && auth.enterprise.code;
            if (!enterpriseCode || model.enterpriseCode && model.enterpriseCode !== enterpriseCode) throw this.error('ERR_UNIT_00002', 'Enterprise-scoped units requires matching authenticated enterprise');
            model.enterpriseCode = enterpriseCode;
        } else { delete model.enterpriseCode; }
        let separator = (this.policy().identity || {}).separator || '::';
        model.code = [scopeType, enterpriseCode || 'global', type, this.code(businessCode, type)].join(separator);
        model.scopeType = scopeType; model.status = model.status || 'DRAFT'; return model;
    },
    /** Prepares a Units Dimension. */
    prepareDimensionSave: function (request) {
        this.identity(request, 'dimension', request.model.dimensionCode); this.vector(request.model.dimensionVector); return Promise.resolve(true);
    },
    /** Prepares a Unit definition including compound dimension metadata. */
    prepareUnitSave: function (request) {
        this.identity(request, 'unit', request.model.unitCode); this.code(request.model.dimensionCode, 'Dimension'); this.vector(request.model.dimensionVector);
        let scale = Number(request.model.precisionScale === undefined ? 6 : request.model.precisionScale);
        if (!Number.isInteger(scale) || scale < 0 || scale > Number(this.policy().maximumScale || 18) ||
            !(this.policy().unitKinds || []).includes(request.model.kind || 'LINEAR') ||
            !(this.policy().roundingModes || []).includes(request.model.roundingMode || 'HALF_EVEN')) throw this.error('ERR_UNIT_00002', 'Unit precision, kind, or rounding policy is invalid');
        return Promise.resolve(true);
    },
    /** Prepares an exact geographically scoped conversion. */
    prepareConversionSave: function (request) {
        this.identity(request, 'conversion', request.model.conversionCode); this.code(request.model.fromUnitCode, 'From unit'); this.code(request.model.toUnitCode, 'To unit');
        if (!/^[1-9]\d*$/.test(String(request.model.numerator)) || !/^[1-9]\d*$/.test(String(request.model.denominator))) throw this.error('ERR_UNIT_00001', 'Conversion factor must be positive exact integers');
        let level = request.model.geographicScopeLevel || 'GLOBAL';
        if (!(this.policy().geographicScopeLevels || []).includes(level) || level !== 'GLOBAL' && !request.model.countryCode ||
            ['SUBDIVISION', 'LOCALITY'].includes(level) && !request.model.subdivisionCode || level === 'LOCALITY' && !request.model.localityCode) {
            throw this.error('ERR_UNIT_00004', 'Regional conversion requires its complete geographic scope');
        }
        if (request.model.effectiveFrom && request.model.effectiveTo && new Date(request.model.effectiveFrom) > new Date(request.model.effectiveTo)) throw this.error('ERR_UNIT_00004', 'Conversion effective dates are reversed');
        return Promise.resolve(true);
    },
    /** Rejects hard deletion of Units definitions. */
    rejectHardDelete: function () { return Promise.reject(this.error('ERR_UNIT_00006', 'Units definitions must be retired instead of deleted')); }
};
