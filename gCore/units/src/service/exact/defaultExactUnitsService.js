/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module units/service/exact/DefaultExactUnitsService
 * @description Performs database-neutral exact decimal parsing, rational multiplication, scale, and rounding through canonical strings and BigInt.
 * @layer service
 * @owner units
 * @override Projects may replace arithmetic while preserving canonical decimal input/output, declared rounding, and no binary floating point.
 */
module.exports = {
    /** Initializes exact arithmetic. */ init: function () { return Promise.resolve(true); },
    /** Completes exact arithmetic initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Creates a stable Units error. */ error: function (code, message) { return new CLASSES.NodicsError(code, message); },
    /** Parses a canonical decimal string into signed unscaled BigInt and scale. */
    parse: function (value) {
        if (typeof value !== 'string' || !/^[+-]?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value)) {
            throw this.error('ERR_UNIT_00001', 'Units values must be canonical decimal strings');
        }
        let sign = value[0] === '-' ? -1n : 1n; let unsigned = /^[+-]/.test(value) ? value.slice(1) : value;
        let parts = unsigned.split('.'); let scale = parts[1] ? parts[1].length : 0;
        return { unscaled: sign * BigInt(parts.join('')), scale: scale };
    },
    /** Formats signed unscaled BigInt at a declared scale into canonical decimal text. */
    format: function (unscaled, scale) {
        let negative = unscaled < 0n; let digits = (negative ? -unscaled : unscaled).toString();
        if (scale > 0) { digits = digits.padStart(scale + 1, '0'); digits = digits.slice(0, -scale) + '.' + digits.slice(-scale); }
        return (negative && unscaled !== 0n ? '-' : '') + digits;
    },
    /** Adds two canonical decimal strings exactly and returns a declared scale. */
    add: function (left, right, targetScale, roundingMode) {
        let a = this.parse(left); let b = this.parse(right); let common = Math.max(a.scale, b.scale);
        let sum = a.unscaled * 10n ** BigInt(common - a.scale) + b.unscaled * 10n ** BigInt(common - b.scale);
        return this.multiplyRational(this.format(sum, common), '1', '1', targetScale, roundingMode || 'UNNECESSARY');
    },
    /** Returns whether a remainder increments the retained absolute quotient under the configured mode. */
    shouldIncrement: function (quotient, remainder, divisor, mode) {
        if (remainder === 0n) return false;
        if (mode === 'UNNECESSARY') throw this.error('ERR_UNIT_00001', 'Rounding was required but the policy is UNNECESSARY');
        if (mode === 'DOWN') return false;
        if (mode === 'UP') return true;
        let doubled = remainder * 2n;
        if (mode === 'HALF_UP') return doubled >= divisor;
        if (mode === 'HALF_EVEN') return doubled > divisor || (doubled === divisor && quotient % 2n !== 0n);
        throw this.error('ERR_UNIT_00001', 'Unsupported rounding mode');
    },
    /** Multiplies an exact decimal by a positive rational factor and returns the requested scale. */
    multiplyRational: function (value, numerator, denominator, targetScale, roundingMode) {
        let parsed = this.parse(value); let config = CONFIG.get('units') || {};
        let scale = Number(targetScale); let maxScale = Number(config.maximumScale || 18);
        if (!Number.isInteger(scale) || scale < 0 || scale > maxScale || !/^[1-9]\d*$/.test(String(numerator)) || !/^[1-9]\d*$/.test(String(denominator))) {
            throw this.error('ERR_UNIT_00001', 'Invalid exact conversion factor or target scale');
        }
        let power = targetScale >= parsed.scale ? 10n ** BigInt(targetScale - parsed.scale) : 1n;
        let divisorScale = targetScale >= parsed.scale ? 1n : 10n ** BigInt(parsed.scale - targetScale);
        let dividend = parsed.unscaled * BigInt(numerator) * power;
        let divisor = BigInt(denominator) * divisorScale; let negative = dividend < 0n;
        let absolute = negative ? -dividend : dividend; let quotient = absolute / divisor; let remainder = absolute % divisor;
        if (this.shouldIncrement(quotient, remainder, divisor, roundingMode || 'HALF_EVEN')) quotient++;
        return this.format(negative ? -quotient : quotient, scale);
    }
};
