/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module payment/test/paymentCancellationExecutionContract
 * @description Protects original-rail Payment void/refund execution for approved Order cancellation.
 * @layer test
 * @owner payment
 * @override Projects may replace provider adapters while preserving exact amount bounds, original routing, service authentication, and idempotency.
 */
const assert = require("assert");
const properties = require("../config/properties");
const policy = require("../src/service/policy/defaultPaymentPolicyService");
const execution = require("../src/service/cancellation/defaultPaymentCancellationExecutionService");

global.CONFIG = { get: (key) => key === "payment" ? properties.payment : undefined };
global.CLASSES = { NodicsError: class NodicsError extends Error { constructor(message, cause, code) { super(String(message)); this.code = code; this.cause = cause; } } };
let transactions = [
  { enterpriseCode: "enterpriseA", transactionCode: "auth-1", idempotencyKey: "auth-key", providerCode: "providerA", paymentModeCode: "CARD", paymentGroupCode: "group-auth", orderCode: "order-1", operation: "AUTHORIZE", amount: "30.00", currencyCode: "USD", status: "AUTHORIZED" },
  { enterpriseCode: "enterpriseA", transactionCode: "capture-1", idempotencyKey: "capture-key", providerCode: "providerA", paymentModeCode: "CARD", paymentGroupCode: "group-capture", orderCode: "order-1", operation: "CAPTURE", amount: "20.00", currencyCode: "USD", status: "CAPTURED" },
];
let calls = [];
const clone = value => JSON.parse(JSON.stringify(value));
const matches = (model, query) => Object.entries(query || {}).every(([key, value]) => model[key] === value);
global.SERVICE = {
  DefaultPaymentPolicyService: policy,
  DefaultPaymentTransactionService: {
    get: async request => ({ result: transactions.filter(value => matches(value, request.query)) }),
    save: async request => { transactions.push(clone(request.model)); return { result: [request.model] }; },
  },
  DefaultPaymentProviderGatewayService: {
    void: async request => { calls.push(request.transaction); return { status: "VOIDED", providerTransactionRef: "void::" + request.transaction.transactionCode }; },
    refund: async request => { calls.push(request.transaction); return { status: "REFUNDED", providerTransactionRef: "refund::" + request.transaction.transactionCode }; },
  },
};
const request = allocations => ({ tenant: "tenantA", authData: { tokenType: "service", principalId: "workflow" }, body: {
  enterpriseCode: "enterpriseA", cancellationCode: "cancel-1", orderCode: "order-1", requestVersion: 2, allocations: allocations,
} });

(async () => {
  let result = await execution.execute(request([
    { paymentGroupCode: "group-auth", originalTransactionCode: "auth-1", providerCode: "providerA", paymentModeCode: "CARD", amount: "10.00", currencyCode: "USD" },
    { paymentGroupCode: "group-capture", originalTransactionCode: "capture-1", amount: "5.50", currencyCode: "USD" },
  ]));
  assert.deepStrictEqual(result.transactions.map(value => value.operation), ["VOID", "REFUND"]);
  assert.deepStrictEqual(result.transactions.map(value => value.providerCode), ["providerA", "providerA"]);
  assert.strictEqual(calls.length, 2);
  let replay = await execution.execute(request([
    { paymentGroupCode: "group-auth", originalTransactionCode: "auth-1", providerCode: "providerA", paymentModeCode: "CARD", amount: "10.00", currencyCode: "USD" },
    { paymentGroupCode: "group-capture", originalTransactionCode: "capture-1", amount: "5.50", currencyCode: "USD" },
  ]));
  assert.strictEqual(replay.transactions.every(value => value.idempotent), true);
  assert.strictEqual(calls.length, 2);
  let conflictingReplay = request([{ paymentGroupCode: "group-auth", originalTransactionCode: "auth-1", amount: "11.00", currencyCode: "USD" }]);
  await assert.rejects(execution.execute(conflictingReplay), error => error.code === "ERR_PAY_00013");
  await assert.rejects(execution.execute(request([{ paymentGroupCode: "group-capture", originalTransactionCode: "capture-1", providerCode: "providerB", amount: "1.00", currencyCode: "USD" }])), error => error.code === "ERR_PAY_00012");
  let excessive = request([{ paymentGroupCode: "group-capture", originalTransactionCode: "capture-1", amount: "20.00", currencyCode: "USD" }]);
  excessive.body.cancellationCode = "cancel-2";
  await assert.rejects(execution.execute(excessive), error => error.code === "ERR_PAY_00012");
  await assert.rejects(execution.execute({ tenant: "tenantA", authData: { tokenType: "access" }, body: {} }), error => error.code === "ERR_PAY_00011");
  const route = require("../src/router/routers").payment.cancellationIntent.execute;
  assert.strictEqual(route.apiExposure, "moduleInternal");
  assert.strictEqual(route.permissionConfig, "authSecurity.internalToken.routePermission");
  const schema = require("../src/schemas/schemas").payment.paymentTransaction;
  assert.strictEqual(schema.definition.parentTransactionCode.type, "string");
  console.log("Payment cancellation execution contract validated");
})().catch(error => { console.error(error); process.exit(1); });
