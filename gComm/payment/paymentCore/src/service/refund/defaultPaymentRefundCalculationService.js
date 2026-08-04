/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module payment/service/refund/DefaultPaymentRefundCalculationService
 * @description Calculates safe refundable amounts from Order-provided payment allocation evidence before Payment creates refund transaction evidence.
 * @layer service
 * @owner payment
 * @override Customer modules may replace refund calculation policy for shipping, tax, discount, goodwill, restocking fees, and provider-specific rounding while preserving exact decimal strings and safe evidence.
 */
module.exports = {
  /** Initializes refund calculation. */
  init: function () {
    return Promise.resolve(true);
  },
  /** Completes refund calculation startup. */
  postInit: function () {
    return Promise.resolve(true);
  },
  /** Returns layered payment policy. */
  config: function () {
    return (CONFIG.get("payment") || {}).paymentPolicy || {};
  },
  /** Returns layered refund calculation policy. */
  policy: function () {
    return this.config().refundCalculation || {};
  },
  /** Creates a stable calculation error. */
  error: function (message) {
    if (typeof CLASSES !== "undefined" && CLASSES.NodicsError)
      return new CLASSES.NodicsError(message, null, "ERR_PAY_00005");
    let error = new Error(message);
    error.code = "ERR_PAY_00005";
    return error;
  },
  /** Rejects unsafe calculation payloads. */
  assertSafe: function (value) {
    if (
      JSON.stringify(value || {}).match(
        /cvv|cardNumber|pan|secret|password|rawGateway|gatewayPayload|providerPayload/i,
      )
    ) {
      throw this.error(
        "Payment refund calculation must not contain raw credentials, raw provider payloads, or card data",
      );
    }
  },
  /** Validates exact money through Payment policy. */
  validateMoney: function (value) {
    if (
      SERVICE.DefaultPaymentPolicyService &&
      typeof SERVICE.DefaultPaymentPolicyService.validateMoney === "function"
    ) {
      return SERVICE.DefaultPaymentPolicyService.validateMoney(value);
    }
    return (
      typeof value === "string" && /^(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(value)
    );
  },
  /** Resolves the maximum scale used for safe string arithmetic. */
  scale: function () {
    return Number(this.config().maximumScale || 18);
  },
  /** Converts an exact decimal string into scaled integer units. */
  toScaled: function (value) {
    if (!this.validateMoney(value))
      throw this.error(
        "Refund amount must be an exact non-negative decimal string",
      );
    let scale = this.scale();
    let parts = String(value).split(".");
    let fraction = (parts[1] || "").padEnd(scale, "0").slice(0, scale);
    return BigInt(parts[0] + fraction);
  },
  /** Converts scaled integer units back to a canonical decimal string. */
  fromScaled: function (value) {
    let scale = this.scale();
    let negative = value < 0n;
    let absolute = negative ? -value : value;
    let padded = absolute.toString().padStart(scale + 1, "0");
    let head = padded.slice(0, -scale) || "0";
    let tail = padded.slice(-scale).replace(/0+$/, "");
    return (negative ? "-" : "") + head + (tail ? "." + tail : "");
  },
  /** Parses an exact non-negative decimal into integer and declared scale. */
  parseExact: function (value, label) {
    if (!this.validateMoney(value))
      throw this.error(label + " must be an exact non-negative decimal string");
    let parts = value.split(".");
    return { unscaled: BigInt(parts.join("")), scale: (parts[1] || "").length };
  },
  /** Aligns two exact non-negative values to a common scale. */
  alignExact: function (left, right) {
    let a = this.parseExact(left, "Refund quantity");
    let b = this.parseExact(right, "Refund quantity");
    let scale = Math.max(a.scale, b.scale);
    return {
      left: a.unscaled * 10n ** BigInt(scale - a.scale),
      right: b.unscaled * 10n ** BigInt(scale - b.scale),
    };
  },
  /** Converts money to configured currency minor units without silent rounding. */
  toMinor: function (value) {
    let parsed = this.parseExact(value, "Refund allocation amount");
    let scale = Number(this.config().defaultCurrencyScale || 2);
    if (!Number.isInteger(scale) || scale < 0 || scale > this.scale())
      throw this.error("Refund currency scale is invalid");
    if (parsed.scale > scale) {
      let divisor = 10n ** BigInt(parsed.scale - scale);
      if (parsed.unscaled % divisor !== 0n)
        throw this.error("Refund allocation amount exceeds configured currency scale");
      return parsed.unscaled / divisor;
    }
    return parsed.unscaled * 10n ** BigInt(scale - parsed.scale);
  },
  /** Formats configured currency minor units. */
  fromMinor: function (value) {
    let scale = Number(this.config().defaultCurrencyScale || 2);
    let digits = value.toString().padStart(scale + 1, "0");
    let head = scale ? digits.slice(0, -scale) : digits;
    let tail = scale ? digits.slice(-scale).replace(/0+$/, "") : "";
    return head + (tail ? "." + tail : "");
  },
  /** Divides positive integers using configured deterministic commercial rounding. */
  divideRounded: function (numerator, denominator) {
    if (denominator <= 0n) throw this.error("Refund quantity denominator must be positive");
    let quotient = numerator / denominator;
    let remainder = numerator % denominator;
    let mode = this.policy().roundingMode || "HALF_EVEN";
    if (mode === "UP" && remainder > 0n) return quotient + 1n;
    if (mode === "DOWN" || remainder === 0n) return quotient;
    if (mode === "HALF_UP") return remainder * 2n >= denominator ? quotient + 1n : quotient;
    if (mode === "HALF_EVEN") return remainder * 2n > denominator || (remainder * 2n === denominator && quotient % 2n !== 0n) ? quotient + 1n : quotient;
    throw this.error("Refund calculation rounding mode is unsupported");
  },
  /** Extracts generated-service or direct arrays. */
  items: function (value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (Array.isArray(value.result)) return value.result;
    if (Array.isArray(value.items)) return value.items;
    return [value];
  },
  /** Filters Order-provided payment allocation evidence to the returned scope. */
  eligibleAllocations: function (request) {
    let policy = this.policy();
    let allocations = this.items(
      request.paymentAllocations || request.orderPaymentAllocations,
    );
    if (
      allocations.length >
      Number(
        policy.maximumAggregateRecords ||
          this.config().maximumAggregateRecords ||
          1000,
      )
    ) {
      throw this.error(
        "Refund calculation exceeds configured allocation bounds",
      );
    }
    if (!allocations.length)
      throw this.error(
        "Refund calculation requires payment allocation evidence",
      );
    let codes = new Set(
      [].concat(request.allocationCodes || []).filter(Boolean),
    );
    let paymentGroupCode = request.paymentGroupCode;
    let filtered = allocations.filter((allocation) => {
      if (paymentGroupCode && allocation.paymentGroupCode !== paymentGroupCode)
        return false;
      if (!codes.size) return true;
      return (
        codes.has(allocation.allocationCode) ||
        codes.has(allocation.sourceAllocationCode)
      );
    });
    if (!filtered.length)
      throw this.error(
        "Refund calculation found no eligible payment allocations",
      );
    let currencyCodes = new Set(
      filtered.map((allocation) => allocation.currencyCode).filter(Boolean),
    );
    if (currencyCodes.size !== 1)
      throw this.error("Refund calculation requires one currency");
    filtered.forEach((allocation) => {
      if (!this.validateMoney(allocation.amount))
        throw this.error(
          "Refund allocation amount must be an exact non-negative decimal string",
        );
    });
    return filtered;
  },
  /** Scopes original payment allocations to cancellation quantities with deterministic remainder distribution. */
  cancellationAllocations: function (request, allocations) {
    let selections = [].concat(request.cancellationItems || []).filter(Boolean);
    if (!selections.length) return allocations;
    let selectedCodes = new Set();
    let scoped = [];
    selections.forEach((selection) => {
      if (!selection.entryCode || selectedCodes.has(selection.entryCode))
        throw this.error("Cancellation refund selection contains an invalid or duplicate Order entry");
      selectedCodes.add(selection.entryCode);
      let entryAllocations = allocations.filter((allocation) => allocation.entryCode === selection.entryCode);
      if (!entryAllocations.length)
        throw this.error("Cancellation refund selection has no payment allocation evidence");
      let quantities = entryAllocations.map((allocation) => this.parseExact(allocation.quantity, "Payment allocation quantity"));
      let quantityScale = Math.max.apply(null, quantities.map((quantity) => quantity.scale));
      let totalQuantity = quantities.reduce((sum, quantity) => sum + quantity.unscaled * 10n ** BigInt(quantityScale - quantity.scale), 0n);
      let requested = this.parseExact(selection.requestedQuantity, "Cancellation requested quantity");
      let requestedQuantity;
      if (requested.scale > quantityScale) {
        totalQuantity *= 10n ** BigInt(requested.scale - quantityScale);
        quantityScale = requested.scale;
        requestedQuantity = requested.unscaled;
      } else {
        requestedQuantity = requested.unscaled * 10n ** BigInt(quantityScale - requested.scale);
      }
      if (requestedQuantity <= 0n || requestedQuantity > totalQuantity)
        throw this.error("Cancellation requested quantity exceeds payment allocation quantity");
      let totalMinor = entryAllocations.reduce((sum, allocation) => sum + this.toMinor(allocation.amount), 0n);
      let targetMinor = this.divideRounded(totalMinor * requestedQuantity, totalQuantity);
      let shares = entryAllocations.map((allocation) => {
        let numerator = this.toMinor(allocation.amount) * requestedQuantity;
        return { allocation: allocation, minor: numerator / totalQuantity, remainder: numerator % totalQuantity };
      });
      let remainderUnits = targetMinor - shares.reduce((sum, share) => sum + share.minor, 0n);
      shares.sort((left, right) => left.remainder === right.remainder ? String(left.allocation.allocationCode).localeCompare(String(right.allocation.allocationCode)) : left.remainder > right.remainder ? -1 : 1);
      for (let index = 0; index < Number(remainderUnits); index++) shares[index].minor += 1n;
      shares.forEach((share) => scoped.push(Object.assign({}, share.allocation, {
        amount: this.fromMinor(share.minor),
        sourceAmount: share.allocation.amount,
        cancellationRequestedQuantity: selection.requestedQuantity,
      })));
    });
    return scoped;
  },
  /**
   * Applies shipping refund within the paymentCore-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @param {*} allocations Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  applyShippingRefund: function (request, allocations) { let shipping=request.shippingRefundEvidence||{}, amount=shipping.shippingRefundAmount; if(!amount||/^0(?:\.0+)?$/.test(amount)) return allocations; if(shipping.shippingAmountIncludedInAllocation!==false||!shipping.paymentAllocationCode||shipping.currencyCode!==allocations[0].currencyCode) throw this.error('Shipping Refund requires separate original Payment allocation evidence'); let matches=allocations.filter(value=>value.allocationCode===shipping.paymentAllocationCode||value.sourceAllocationCode===shipping.paymentAllocationCode); if(matches.length!==1) throw this.error('Shipping Refund original Payment allocation is unavailable'); return allocations.map(value=>value!==matches[0]?value:Object.assign({},value,{amount:this.fromScaled(this.toScaled(value.amount)+this.toScaled(amount)),sourceAmount:value.sourceAmount||value.amount,shippingRefundAmount:amount,deliveryChargeEvidenceCode:shipping.deliveryChargeEvidenceCode})); },
  /** Calculates a safe refundable amount from allocations and optional explicit override. */
  calculate: function (request) {
    if (!request || !request.orderCode || !request.entCode) {
      throw this.error("Refund calculation requires orderCode and entCode");
    }
    this.assertSafe(request);
    let policy = this.policy();
    let allocations = this.applyShippingRefund(request, this.cancellationAllocations(request, this.eligibleAllocations(request)));
    let eligibleScaled = allocations.reduce(
      (sum, allocation) => sum + this.toScaled(allocation.amount),
      0n,
    );
    let refundScaled = eligibleScaled;
    if (request.refundAmount || request.amount) {
      if (policy.allowExplicitAmount === false)
        throw this.error("Explicit refund amount is disabled by policy");
      refundScaled = this.toScaled(request.refundAmount || request.amount);
      if (
        policy.explicitAmountMustNotExceedEligible !== false &&
        refundScaled > eligibleScaled
      ) {
        throw this.error(
          "Explicit refund amount exceeds eligible payment allocation amount",
        );
      }
    }
    let currencyCode = allocations[0].currencyCode;
    let paymentGroupCodes = Array.from(
      new Set(
        allocations
          .map((allocation) => allocation.paymentGroupCode)
          .filter(Boolean),
      ),
    );
    return {
      calculationCode:
        request.calculationCode ||
        [
          "refundCalculation",
          request.idempotencyKey || request.returnCode || request.orderCode,
        ]
          .filter(Boolean)
          .join("::"),
      strategy: request.cancellationItems && request.cancellationItems.length ? policy.cancellationStrategy || "PROPORTIONAL_ORIGINAL_PAYMENT_ALLOCATIONS" : policy.defaultStrategy || "SUM_PAYMENT_ALLOCATIONS",
      orderCode: request.orderCode,
      returnCode: request.returnCode,
      paymentGroupCode: request.paymentGroupCode || paymentGroupCodes[0],
      paymentGroupCodes: paymentGroupCodes,
      amount: this.fromScaled(refundScaled),
      eligibleAmount: this.fromScaled(eligibleScaled),
      currencyCode: currencyCode,
      allocationCodes: allocations
        .map((allocation) => allocation.allocationCode)
        .filter(Boolean),
      sourceAllocationCodes: allocations
        .map((allocation) => allocation.sourceAllocationCode)
        .filter(Boolean),
      allocationEvidence: allocations.map((allocation) => ({
        allocationCode: allocation.allocationCode,
        sourceAllocationCode: allocation.sourceAllocationCode,
        entryCode: allocation.entryCode,
        paymentGroupCode: allocation.paymentGroupCode,
        amount: allocation.amount,
        currencyCode: allocation.currencyCode,
        sourceAmount: allocation.sourceAmount || allocation.amount,
        cancellationRequestedQuantity: allocation.cancellationRequestedQuantity,
        shippingRefundAmount: allocation.shippingRefundAmount,
        deliveryChargeEvidenceCode: allocation.deliveryChargeEvidenceCode,
        originalTransactionCode: allocation.originalTransactionCode,
        providerCode: allocation.providerCode,
        paymentModeCode: allocation.paymentModeCode,
      })),
      evidence: {
        includeShipping: policy.includeShipping === true,
        includeTax: policy.includeTax !== false,
        includeDiscount: policy.includeDiscount !== false,
        explicitAmountApplied: Boolean(request.refundAmount || request.amount),
        allocationCount: allocations.length,
        cancellationQuantityScoped: Boolean(request.cancellationItems && request.cancellationItems.length),
        roundingMode: policy.roundingMode || "HALF_EVEN",
      },
    };
  },
};
