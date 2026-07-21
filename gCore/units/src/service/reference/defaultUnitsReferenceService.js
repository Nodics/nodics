/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module units/service/reference/DefaultUnitsReferenceService
 * @description Resolves authoritative Units and performs exact, scoped conversion for co-hosted and secured module consumers.
 * @layer service
 * @owner units
 * @override Projects may extend definition selection while preserving exact arithmetic, scope isolation, deterministic geography, and allow-listed output.
 */
module.exports = {
    /** Initializes the reference service. */ init: function () { return Promise.resolve(true); },
    /** Completes reference-service initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Returns effective reference-conversion policy. */
    policy: function () { return ((CONFIG.get('units') || {}).referenceConversion) || {}; },
    /** Extracts generated-service result items. */
    items: function (response) { return response && Array.isArray(response.result) ? response.result : []; },
    /** Resolves the authenticated enterprise without making enterprise scope mandatory for global definitions. */
    enterpriseCode: function (request) {
        let auth = request && request.authData || {};
        return auth.entCode || auth.enterpriseCode || auth.enterprise && auth.enterprise.code;
    },
    /** Validates that remote route use is restricted to module identities. */
    validateServiceIdentity: function (request) {
        if (this.policy().requireServiceToken !== false && (!request.authData || request.authData.tokenType !== 'service')) {
            throw new CLASSES.NodicsError('ERR_UNIT_00007', 'Units reference conversion requires an internal service identity');
        }
        return true;
    },
    /** Returns whether a definition is visible in the authenticated global/enterprise scope. */
    isVisible: function (definition, enterpriseCode) {
        return definition.scopeType === 'GLOBAL' || definition.scopeType === 'ENTERPRISE' &&
            !!enterpriseCode && definition.enterpriseCode === enterpriseCode;
    },
    /** Selects one active Unit, preferring the authenticated enterprise definition over global fallback. */
    selectUnit: function (definitions, enterpriseCode, unitCode) {
        let candidates = (definitions || []).filter(item => item.status === 'ACTIVE' && item.unitCode === unitCode && this.isVisible(item, enterpriseCode));
        let rank = candidates.some(item => item.scopeType === 'ENTERPRISE') ? 'ENTERPRISE' : 'GLOBAL';
        candidates = candidates.filter(item => item.scopeType === rank);
        if (candidates.length !== 1) throw new CLASSES.NodicsError('ERR_UNIT_00002', 'Active Units Unit is missing or ambiguous');
        return candidates[0];
    },
    /** Loads one active Unit through the private generated service. */
    loadUnit: async function (request, enterpriseCode, unitCode) {
        unitCode = SERVICE.DefaultUnitsDefinitionService.code(unitCode, 'Unit');
        let maximum = Math.max(2, Number(this.policy().maximumDefinitionResults || 20));
        let response = await SERVICE.DefaultUnitOfMeasureService.get({ tenant: request.tenant, authData: request.authData,
            query: { unitCode: unitCode, status: 'ACTIVE' }, searchOptions: { limit: maximum + 1 } });
        let items = this.items(response);
        if (items.length > maximum) throw new CLASSES.NodicsError('ERR_UNIT_00002', 'Units Unit result boundary was exceeded');
        return this.selectUnit(items, enterpriseCode, unitCode);
    },
    /** Loads visible direct or reverse conversion candidates without exposing generated CRUD. */
    loadConversions: async function (request, enterpriseCode, fromUnitCode, toUnitCode) {
        let maximum = Math.max(2, Number(this.policy().maximumDefinitionResults || 20));
        let load = async (from, to) => this.items(await SERVICE.DefaultUnitConversionService.get({ tenant: request.tenant,
            authData: request.authData, query: { fromUnitCode: from, toUnitCode: to, status: 'ACTIVE' }, searchOptions: { limit: maximum + 1 } }));
        let directRaw = await load(fromUnitCode, toUnitCode);
        if (directRaw.length > maximum) throw new CLASSES.NodicsError('ERR_UNIT_00004', 'Units conversion result boundary was exceeded');
        let direct = directRaw.filter(item => this.isVisible(item, enterpriseCode));
        let reverseRaw = direct.length ? [] : await load(toUnitCode, fromUnitCode);
        if (reverseRaw.length > maximum) throw new CLASSES.NodicsError('ERR_UNIT_00004', 'Units conversion result boundary was exceeded');
        let reverse = reverseRaw.filter(item => this.isVisible(item, enterpriseCode));
        return { candidates: direct.length ? direct : reverse, reversed: !direct.length };
    },
    /** Loads a bounded visible conversion graph for optional exact multi-hop resolution. */
    loadConversionGraph: async function (request, enterpriseCode) { let maximum = Number(this.policy().maximumGraphConversions || 200); let response = await SERVICE.DefaultUnitConversionService.get({ tenant: request.tenant, authData: request.authData, query: { status: 'ACTIVE' }, searchOptions: { pageSize: maximum + 1, pageNumber: 1, sort: { conversionCode: 1 } } }); let items = this.items(response); if (items.length > maximum) throw new CLASSES.NodicsError('ERR_UNIT_00004', 'Units conversion graph boundary was exceeded'); return items.filter(item => this.isVisible(item, enterpriseCode)); },
    /** Returns greatest common divisor for exact rational reduction. */
    gcd: function (left, right) { left = left < 0n ? -left : left; right = right < 0n ? -right : right; while (right) { let next = left % right; left = right; right = next; } return left; },
    /** Resolves one unambiguous shortest conversion path and composes its exact rational factor. */
    resolveMultiHop: async function (request, enterpriseCode, fromUnitCode, toUnitCode) { let policy = this.policy(); if (policy.multiHopEnabled !== true) throw new CLASSES.NodicsError('ERR_UNIT_00005', 'Active units conversion was not found'); let records = await this.loadConversionGraph(request, enterpriseCode); let pairs = new Map(); records.forEach(record => { let key = record.fromUnitCode + '>' + record.toUnitCode; if (!pairs.has(key)) pairs.set(key, []); pairs.get(key).push(record); }); let edges = new Map(); pairs.forEach((values, key) => { let selected; try { selected = this.selectConversion(values, enterpriseCode, request.geography, request.at); } catch (error) { if (error.code !== 'ERR_UNIT_00005') throw error; return; } let add = (from, to, reversed) => { if (!edges.has(from)) edges.set(from, []); edges.get(from).push({ from, to, reversed, conversion: selected }); }; add(selected.fromUnitCode, selected.toUnitCode, false); add(selected.toUnitCode, selected.fromUnitCode, true); }); let maximumHops = Math.max(2, Number(policy.maximumHops || 4)); let queue = [{ unit: fromUnitCode, path: [], visited: new Set([fromUnitCode]) }]; let matches = []; let shortest; while (queue.length) { let current = queue.shift(); if (shortest !== undefined && current.path.length >= shortest || current.path.length >= maximumHops) continue; for (let edge of (edges.get(current.unit) || [])) { if (current.visited.has(edge.to)) continue; let path = current.path.concat(edge); if (edge.to === toUnitCode) { shortest = path.length; matches.push(path); } else { let visited = new Set(current.visited); visited.add(edge.to); queue.push({ unit: edge.to, path, visited }); } } } matches = matches.filter(path => path.length === shortest); if (matches.length !== 1) throw new CLASSES.NodicsError(matches.length ? 'ERR_UNIT_00004' : 'ERR_UNIT_00005', matches.length ? 'Units conversion path is ambiguous' : 'Active units conversion was not found'); let numerator = 1n; let denominator = 1n; matches[0].forEach(edge => { numerator *= BigInt(edge.reversed ? edge.conversion.denominator : edge.conversion.numerator); denominator *= BigInt(edge.reversed ? edge.conversion.numerator : edge.conversion.denominator); let divisor = this.gcd(numerator, denominator); numerator /= divisor; denominator /= divisor; }); let maximumDigits = Number((CONFIG.get('units') || {}).maximumConversionDigits || 128); if (numerator.toString().length > maximumDigits || denominator.toString().length > maximumDigits) throw new CLASSES.NodicsError('ERR_UNIT_00004', 'Composed conversion factor boundary was exceeded'); return { numerator: numerator.toString(), denominator: denominator.toString(), path: matches[0].map(edge => ({ conversionCode: edge.conversion.conversionCode, fromUnitCode: edge.from, toUnitCode: edge.to, reversed: edge.reversed })) }; },
    /** Selects the most-specific geography, then enterprise scope, while reusing Units conversion policy. */
    selectConversion: function (conversions, enterpriseCode, geography, at) {
        let timestamp = new Date(at || Date.now()).getTime();
        let candidates = (conversions || []).filter(item => item.status === 'ACTIVE' &&
            (!item.effectiveFrom || new Date(item.effectiveFrom).getTime() <= timestamp) &&
            (!item.effectiveTo || new Date(item.effectiveTo).getTime() >= timestamp))
            .map(item => ({ item: item, geography: SERVICE.DefaultUnitsConversionPolicyService.specificity(item, geography),
                scope: item.scopeType === 'ENTERPRISE' && item.enterpriseCode === enterpriseCode ? 1 : 0 }))
            .filter(entry => entry.geography >= 0);
        if (!candidates.length) throw new CLASSES.NodicsError('ERR_UNIT_00005', 'Active units conversion was not found');
        let geographyRank = Math.max.apply(null, candidates.map(entry => entry.geography));
        candidates = candidates.filter(entry => entry.geography === geographyRank);
        let scopeRank = Math.max.apply(null, candidates.map(entry => entry.scope));
        candidates = candidates.filter(entry => entry.scope === scopeRank);
        if (candidates.length !== 1) throw new CLASSES.NodicsError('ERR_UNIT_00004', 'Units conversion scope is ambiguous');
        return candidates[0].item;
    },
    /** Returns a minimal Unit projection safe for domain-module validation. */
    projectUnit: function (unit) {
        return { unitCode: unit.unitCode, dimensionCode: unit.dimensionCode, dimensionVector: unit.dimensionVector,
            precisionScale: unit.precisionScale, roundingMode: unit.roundingMode, scopeType: unit.scopeType };
    },
    /** Performs the shared local conversion contract without requiring transport authentication. */
    convertInternal: async function (request) {
        request = request || {}; let input = request.body || request; let enterpriseCode = this.enterpriseCode(request);
        let configuredModes = (CONFIG.get('units') || {}).roundingModes || [];
        if (input.roundingMode && !configuredModes.includes(input.roundingMode) || input.at && !Number.isFinite(new Date(input.at).getTime())) {
            throw new CLASSES.NodicsError('ERR_UNIT_00001', 'Units rounding mode or effective time is invalid');
        }
        let fromUnit = await this.loadUnit(request, enterpriseCode, input.fromUnitCode);
        let toUnit = input.toUnitCode === input.fromUnitCode ? fromUnit : await this.loadUnit(request, enterpriseCode, input.toUnitCode);
        SERVICE.DefaultUnitsConversionPolicyService.assertCompatible(fromUnit, toUnit);
        let roundingMode = input.roundingMode || toUnit.roundingMode || 'UNNECESSARY';
        let targetScale = Number(input.targetScale);
        if (fromUnit.unitCode === toUnit.unitCode) {
            return { quantity: SERVICE.DefaultExactUnitsService.multiplyRational(input.quantity, '1', '1', targetScale, roundingMode),
                fromUnit: this.projectUnit(fromUnit), toUnit: this.projectUnit(toUnit), conversion: null };
        }
        let loaded = await this.loadConversions(request, enterpriseCode, fromUnit.unitCode, toUnit.unitCode); let conversion;
        try { conversion = this.selectConversion(loaded.candidates, enterpriseCode, input.geography, input.at); } catch (error) { if (error.code !== 'ERR_UNIT_00005') throw error; let composed = await this.resolveMultiHop(Object.assign({}, request, { geography: input.geography, at: input.at }), enterpriseCode, fromUnit.unitCode, toUnit.unitCode); return { quantity: SERVICE.DefaultExactUnitsService.multiplyRational(input.quantity, composed.numerator, composed.denominator, targetScale, roundingMode), fromUnit: this.projectUnit(fromUnit), toUnit: this.projectUnit(toUnit), conversion: { multiHop: true, numerator: composed.numerator, denominator: composed.denominator, path: composed.path } }; }
        let numerator = loaded.reversed ? conversion.denominator : conversion.numerator;
        let denominator = loaded.reversed ? conversion.numerator : conversion.denominator;
        return { quantity: SERVICE.DefaultExactUnitsService.multiplyRational(input.quantity, numerator, denominator, targetScale, roundingMode),
            fromUnit: this.projectUnit(fromUnit), toUnit: this.projectUnit(toUnit), conversion: {
                conversionCode: conversion.conversionCode, numerator: numerator, denominator: denominator,
                reversed: loaded.reversed, geographicScopeLevel: conversion.geographicScopeLevel,
                countryCode: conversion.countryCode, subdivisionCode: conversion.subdivisionCode, localityCode: conversion.localityCode
            } };
    },
    /** Validates remote service identity and returns the allow-listed conversion result. */
    convert: async function (request) {
        this.validateServiceIdentity(request);
        return { code: 'SUC_UNIT_00001', data: await this.convertInternal(request) };
    }
};
