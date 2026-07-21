/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module inventory/service/reference/DefaultInventoryUnitsReferenceProviderService
 * @description Converts Stock quantities through the same Units-owned contract in consolidated and modular deployments.
 * @layer service
 * @owner inventory
 * @override Projects may replace topology selection while preserving Units authority, exact output, bounded calls, and fail-closed validation.
 */
module.exports = {
    /** Initializes the provider. */ init: function () { return Promise.resolve(true); },
    /** Completes provider initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Returns effective Units-provider configuration. */
    configuration: function () { return ((CONFIG.get('inventory') || {}).unitsReference) || {}; },
    /** Returns true when the Units intent service is co-hosted. */
    isLocal: function () {
        return this.configuration().preferLocal !== false && SERVICE.DefaultUnitsReferenceService &&
            typeof SERVICE.DefaultUnitsReferenceService.convertInternal === 'function';
    },
    /** Returns a stable dimension-vector key for defensive projection validation. */
    vectorKey: function (vector) {
        return Object.keys(vector || {}).filter(key => Number(vector[key]) !== 0).sort()
            .map(key => key + ':' + Number(vector[key])).join('|');
    },
    /** Validates the minimal conversion projection required by Stock. */
    validate: function (result, input) {
        if (!result || typeof result.quantity !== 'string' || !result.fromUnit || !result.toUnit ||
            result.fromUnit.unitCode !== input.fromUnitCode || result.toUnit.unitCode !== input.toUnitCode ||
            !result.toUnit.dimensionVector || this.vectorKey(result.fromUnit.dimensionVector) !== this.vectorKey(result.toUnit.dimensionVector)) {
            throw new CLASSES.NodicsError('ERR_INV_00011', 'Units conversion response is invalid');
        }
        return result;
    },
    /** Uses the co-hosted Units authority. */
    convertLocal: async function (request, input) {
        return this.validate(await SERVICE.DefaultUnitsReferenceService.convertInternal({ tenant: request.tenant,
            authData: request.authData, body: input }), input);
    },
    /** Uses secured Nodics module communication for a separately deployed Units module. */
    convertRemote: async function (request, input) {
        let config = this.configuration(); let token = NODICS.getInternalAuthToken(request.tenant);
        if (!token) throw new CLASSES.NodicsError('ERR_INV_00011', 'Internal service token is unavailable for Units conversion');
        try {
            let response = await SERVICE.DefaultModuleService.fetch(SERVICE.DefaultModuleService.buildRequest({
                moduleName: config.moduleName || 'units', apiVersion: config.apiVersion || 'v0',
                apiName: config.apiName || '/references/units/convert', methodName: 'POST',
                header: { Authorization: 'Bearer ' + token, 'x-enterprise-code': request.enterpriseCode },
                requestBody: input, timeoutMs: Number(config.requestTimeoutMs || 2000),
                maxAttempts: Number(config.maximumAttempts || 2), responseType: true
            }));
            return this.validate(response && response.data, input);
        } catch (error) {
            if (error && error.code === 'ERR_INV_00011') throw error;
            throw new CLASSES.NodicsError('ERR_INV_00011', 'Remote Units conversion is unavailable');
        }
    },
    /** Selects local or remote Units access without copying Unit or conversion authority. */
    convert: function (request, input) {
        return this.isLocal() ? this.convertLocal(request, input) : this.convertRemote(request, input);
    }
};
