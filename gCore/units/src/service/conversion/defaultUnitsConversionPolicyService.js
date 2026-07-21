/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module units/service/conversion/DefaultUnitsConversionPolicyService
 * @description Validates dimensional compatibility and selects one effective conversion by geographic specificity without ambiguous regional land conversion.
 * @layer service
 * @owner units
 * @override Projects may extend scope matching while retaining deterministic selection and ambiguity rejection.
 */
module.exports = {
    /** Initializes conversion policy. */ init: function () { return Promise.resolve(true); },
    /** Completes conversion policy initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Returns a stable canonical representation of a dimension vector. */
    vectorKey: function (vector) {
        return Object.keys(vector || {}).filter(key => Number(vector[key]) !== 0).sort().map(key => key + ':' + Number(vector[key])).join('|');
    },
    /** Rejects conversions between unequal base-dimension vectors. */
    assertCompatible: function (fromUnit, toUnit) {
        if (!fromUnit || !toUnit || this.vectorKey(fromUnit.dimensionVector) !== this.vectorKey(toUnit.dimensionVector)) {
            throw new CLASSES.NodicsError('ERR_UNIT_00003', 'Units are dimensionally incompatible');
        }
        return true;
    },
    /** Returns geographic specificity or -1 when a conversion does not match context. */
    specificity: function (conversion, geography) {
        let level = conversion.geographicScopeLevel || 'GLOBAL'; geography = geography || {};
        if (level === 'GLOBAL') return 0;
        if (level === 'COUNTRY') return conversion.countryCode === geography.countryCode ? 1 : -1;
        if (level === 'SUBDIVISION') return conversion.countryCode === geography.countryCode && conversion.subdivisionCode === geography.subdivisionCode ? 2 : -1;
        if (level === 'LOCALITY') return conversion.countryCode === geography.countryCode && conversion.subdivisionCode === geography.subdivisionCode &&
            conversion.localityCode === geography.localityCode ? 3 : -1;
        throw new CLASSES.NodicsError('ERR_UNIT_00004', 'Invalid geographic conversion scope');
    },
    /** Selects exactly one most-specific active and effective conversion or fails closed. */
    select: function (conversions, geography, at) {
        let timestamp = new Date(at || Date.now()).getTime();
        let candidates = (conversions || []).filter(item => item.status === 'ACTIVE' &&
            (!item.effectiveFrom || new Date(item.effectiveFrom).getTime() <= timestamp) &&
            (!item.effectiveTo || new Date(item.effectiveTo).getTime() >= timestamp))
            .map(item => ({ item: item, specificity: this.specificity(item, geography) })).filter(entry => entry.specificity >= 0);
        if (!candidates.length) throw new CLASSES.NodicsError('ERR_UNIT_00005', 'Active units conversion was not found');
        let highest = Math.max.apply(null, candidates.map(entry => entry.specificity));
        let selected = candidates.filter(entry => entry.specificity === highest);
        if (selected.length !== 1) throw new CLASSES.NodicsError('ERR_UNIT_00004', 'Units conversion scope is ambiguous');
        return selected[0].item;
    }
};
