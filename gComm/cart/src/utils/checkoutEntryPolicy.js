/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cart/utils/checkoutEntryPolicy
 * @description Shared checkout line-entry policy helpers owned by Cart because Cart contributes the abstractCartEntry schema used by Cart and Order entries.
 * @layer utility
 * @owner cart
 * @override Project modules may override layered checkoutEntry policy or replace consuming services without duplicating entry validation logic.
 */
const DEFAULT_POLICY = {
    requiredFields: [
        'entCode',
        'entryCode',
        'lineNumber',
        'catalogCode',
        'itemType',
        'itemCode',
        'quantity',
        'unitCode',
        'currencyCode',
    ],
    quantityPattern: '^(0|[1-9][0-9]*)(\\.[0-9]+)?$',
    moneyPattern: '^(0|[1-9][0-9]*)(\\.[0-9]+)?$',
    maximumDigits: 38,
    maximumScale: 18,
    statuses: ['ACTIVE', 'HELD', 'RETIRED'],
    moneyFields: ['unitPrice', 'totalPrice', 'taxTotal', 'discountTotal'],
    immutableFields: [
        'code',
        'entCode',
        'entryCode',
        'cartCode',
        'orderCode',
        'catalogCode',
        'itemType',
        'itemCode',
        'unitCode',
        'currencyCode',
    ],
    allowedTransitions: {
        ACTIVE: ['HELD', 'RETIRED'],
        HELD: ['ACTIVE', 'RETIRED'],
        RETIRED: [],
    },
    conversion: {
        sourceParentField: 'cartCode',
        targetParentField: 'orderCode',
        targetStatus: 'ORDERED',
        copiedFields: [
            'entCode',
            'entryCode',
            'lineNumber',
            'catalogCode',
            'itemType',
            'itemCode',
            'quantity',
            'unitCode',
            'currencyCode',
            'unitPrice',
            'totalPrice',
            'taxTotal',
            'discountTotal',
            'priceEvidenceCode',
        ],
    },
};

const clone = function (value) {
    return JSON.parse(JSON.stringify(value || {}));
};

const mergeObject = function (base, override) {
    const result = clone(base);
    Object.entries(override || {}).forEach(([key, value]) => {
        if (value && typeof value === 'object' && !Array.isArray(value) && result[key] && typeof result[key] === 'object' && !Array.isArray(result[key])) {
            result[key] = mergeObject(result[key], value);
        } else {
            result[key] = clone(value);
        }
    });
    return result;
};

const mergePolicy = function (policy) {
    return mergeObject(DEFAULT_POLICY, policy);
};

const digits = function (value) {
    const parts = String(value).split('.');
    return {
        total: (parts[0] + (parts[1] || '')).length,
        scale: (parts[1] || '').length,
    };
};

const isZero = function (value) {
    return /^0(?:\.0+)?$/.test(String(value));
};

const validateDecimal = function (value, pattern, policy, options) {
    if (typeof value !== 'string') return false;
    const text = String(value === undefined ? '' : value);
    const expression = new RegExp(pattern);
    const precision = digits(text);
    if (!expression.test(text)) return false;
    if (options.positive && isZero(text)) return false;
    return precision.total <= Number(policy.maximumDigits || DEFAULT_POLICY.maximumDigits)
        && precision.scale <= Number(policy.maximumScale || DEFAULT_POLICY.maximumScale);
};

const validateEntry = function (entry, policy, options) {
    const activePolicy = mergePolicy(policy);
    const activeOptions = Object.assign({ parentField: undefined, requireParent: true }, options || {});
    const model = entry || {};
    const errors = [];
    const requiredFields = activePolicy.requiredFields || [];

    requiredFields.forEach((field) => {
        if (model[field] === undefined || model[field] === null || model[field] === '') {
            errors.push(field + ' is required');
        }
    });

    if (activeOptions.requireParent && activeOptions.parentField && !model[activeOptions.parentField]) {
        errors.push(activeOptions.parentField + ' is required');
    }

    if (!Number.isInteger(Number(model.lineNumber)) || Number(model.lineNumber) <= 0) {
        errors.push('lineNumber must be a positive integer');
    }

    if (!validateDecimal(model.quantity, activePolicy.quantityPattern, activePolicy, { positive: true })) {
        errors.push('quantity must be an exact positive decimal string');
    }

    (activePolicy.moneyFields || []).forEach((field) => {
        if (model[field] !== undefined && !validateDecimal(model[field], activePolicy.moneyPattern, activePolicy, { positive: false })) {
            errors.push(field + ' must be an exact non-negative decimal string');
        }
    });

    if (!(activePolicy.statuses || []).includes(model.status || 'ACTIVE')) {
        errors.push('status is not allowed');
    }

    return {
        valid: errors.length === 0,
        errors: errors,
        model: Object.assign({}, model, { status: model.status || 'ACTIVE' }),
    };
};

const validateUpdate = function (current, patch, policy) {
    const activePolicy = mergePolicy(policy);
    const errors = [];
    const currentModel = current || {};
    const update = patch || {};

    (activePolicy.immutableFields || []).forEach((field) => {
        if (update[field] !== undefined && JSON.stringify(update[field]) !== JSON.stringify(currentModel[field])) {
            errors.push(field + ' is immutable');
        }
    });

    if (update.status && update.status !== currentModel.status) {
        const allowed = (activePolicy.allowedTransitions || {})[currentModel.status] || [];
        if (!allowed.includes(update.status)) errors.push('status transition is not allowed');
    }

    const merged = Object.assign({}, currentModel, update);
    return validateEntry(merged, activePolicy, {
        parentField: currentModel.orderCode !== undefined ? 'orderCode' : 'cartCode',
        requireParent: false,
    }).errors.concat(errors);
};

const buildOrderEntryFromCartEntry = function (cartEntry, orderContext, policy) {
    const activePolicy = mergePolicy(policy);
    const conversion = activePolicy.conversion || DEFAULT_POLICY.conversion;
    const source = cartEntry || {};
    const context = orderContext || {};
    const target = {};

    (conversion.copiedFields || []).forEach((field) => {
        if (source[field] !== undefined) target[field] = source[field];
    });

    target[conversion.targetParentField || 'orderCode'] = context.orderCode;
    target[conversion.sourceParentField || 'cartCode'] = source[conversion.sourceParentField || 'cartCode'];
    target.status = context.status || conversion.targetStatus || 'ORDERED';

    if (context.entryCodePrefix) target.entryCode = context.entryCodePrefix + target.entryCode;
    if (context.allocationCode) target.allocationCode = context.allocationCode;
    if (context.reservationCode || source.reservationCode) target.reservationCode = context.reservationCode || source.reservationCode;

    return target;
};

module.exports = {
    DEFAULT_POLICY,
    mergePolicy,
    validateEntry,
    validateUpdate,
    buildOrderEntryFromCartEntry,
};
