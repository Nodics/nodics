/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module order/test/orderLifecycleRequestFoundationContract
 * @description Protects private Order-owned cancellation, return, and refund request evidence without claiming adjacent-module execution authority.
 * @layer test
 * @owner order
 * @override Project modules may extend request policy while preserving exact quantities, immutable evidence, bounded inputs, and private persistence.
 */
const assert = require("assert");

global.ENUMS = {
  ReasonType: {
    ORDERSTATUS: { key: "ORDERSTATUS" },
    PAYMENT: { key: "PAYMENT" },
    SHIPMENT: { key: "SHIPMENT" },
  },
};

const properties = require("../config/properties");
global.CONFIG = {
  get: (key) => (key === "order" ? properties.order : undefined),
};
global.CLASSES = {
  NodicsError: class NodicsError extends Error {
    constructor(message, cause, code) {
      super(String(message));
      this.code = code;
      this.cause = cause;
    }
  },
};

const schemas = require("../src/schemas/schemas").order;
const interceptors = require("../src/interceptors/interceptors");
const policy = require("../src/service/lifecycle/defaultOrderLifecycleRequestPolicyService");
const requestSchema = schemas.orderLifecycleRequest;
const itemSchema = schemas.orderLifecycleRequestItem;
const lifecycleConfig = properties.order.orderLifecycle;

assert.strictEqual(requestSchema.model, true);
assert.strictEqual(requestSchema.router.enabled, false);
assert.strictEqual(itemSchema.router.enabled, false);
assert.deepStrictEqual(requestSchema.transaction, { enabled: true, sideEffects: "none" });
assert.deepStrictEqual(itemSchema.transaction, { enabled: true, sideEffects: "none" });
assert.strictEqual(requestSchema.refSchema.orderCode.schemaName, "order");
assert.strictEqual(
  itemSchema.refSchema.requestCode.schemaName,
  "orderLifecycleRequest",
);
assert.strictEqual(
  requestSchema.indexes.individual.requestCode.options.unique,
  true,
);
assert.strictEqual(
  requestSchema.indexes.individual.idempotencyKey.options.unique,
  true,
);
assert.strictEqual(
  itemSchema.indexes.individual.requestItemCode.options.unique,
  true,
);
assert.strictEqual(requestSchema.definition.version.required, true);
assert.strictEqual(itemSchema.definition.requestedQuantity.type, "string");
assert.strictEqual(itemSchema.definition.immutableEvidence.required, true);
assert(properties.order.orderLifecycle.requestStates.includes('EXPIRED'));
assert(properties.order.orderLifecycle.terminalRequestStates.includes('COMPLETED'));
assert(properties.order.orderLifecycle.itemStates.includes('PARTIALLY_AUTHORIZED'));
assert(properties.order.orderLifecycle.itemStates.includes('DISPOSITIONED'));
assert(properties.order.orderLifecycle.reasonCodes.REFUND.includes('SERVICE_CREDIT'));
assert(properties.order.orderLifecycle.reasonCodes.RETURN.includes('NO_REFUND'));
assert.deepStrictEqual(lifecycleConfig.requestTypes, [
  "CANCELLATION",
  "RETURN",
  "REFUND",
]);

[
  "orderLifecycleRequestPreSavePolicy",
  "orderLifecycleRequestPreUpdatePolicy",
  "orderLifecycleRequestPreRemovePolicy",
  "orderLifecycleRequestItemPreSavePolicy",
  "orderLifecycleRequestItemPreUpdatePolicy",
  "orderLifecycleRequestItemPreRemovePolicy",
].forEach((name) =>
  assert(
    interceptors[name],
    name + " must protect private lifecycle persistence",
  ),
);

const base = {
  tenant: "default",
  authData: { tokenType: "access", principalId: "employee-1" },
  orderLifecycle: {
    entCode: "enterprise-1",
    orderCode: "order-1",
    idempotencyKey: "cancel-order-1-line-1",
    requestType: "CANCELLATION",
    reasonCode: "CUSTOMER_REQUEST",
    customerCode: "customer-1",
    items: [
      {
        orderEntryCode: "order-entry-1",
        requestedQuantity: "1.250",
        unitCode: "EA",
        serialNumbers: ["serial-1"],
        immutableEvidence: {
          orderEntryCode: "order-entry-1",
          orderedQuantity: "3.000",
        },
      },
    ],
  },
};

const clone = (value) => JSON.parse(JSON.stringify(value));

(async () => {
  const draft = policy.buildDraft(clone(base));
  assert.strictEqual(draft.request.requestType, "CANCELLATION");
  assert.strictEqual(draft.request.state, "DRAFT");
  assert.strictEqual(draft.request.version, 1);
  assert.strictEqual(draft.items[0].requestedQuantity, "1.250");
  assert.strictEqual(draft.items[0].state, "REQUESTED");
  assert.strictEqual(draft.items[0].requestCode, draft.request.requestCode);
  assert.strictEqual(
    draft.request.requestCode.includes("cancel-order-1-line-1"),
    true,
  );

  await assert.rejects(
    policy.authorizeMutation({}),
    (error) => error.code === "ERR_ORD_00044",
  );
  await policy.authorizeMutation({ _orderLifecycleMutationAuthorized: true });
  await assert.rejects(
    policy.rejectHardDelete(),
    (error) => error.code === "ERR_ORD_00044",
  );

  const zeroQuantity = clone(base);
  zeroQuantity.orderLifecycle.items[0].requestedQuantity = "0.00";
  assert.throws(
    () => policy.buildDraft(zeroQuantity),
    /exact positive decimal string/,
  );

  const numericQuantity = clone(base);
  numericQuantity.orderLifecycle.items[0].requestedQuantity = 1.25;
  assert.throws(
    () => policy.buildDraft(numericQuantity),
    /exact positive decimal string/,
  );

  const duplicateSerial = clone(base);
  duplicateSerial.orderLifecycle.items[0].serialNumbers = [
    "serial-1",
    "serial-1",
  ];
  assert.throws(
    () => policy.buildDraft(duplicateSerial),
    /contains duplicates/,
  );

  const unsupportedReason = clone(base);
  unsupportedReason.orderLifecycle.reasonCode = "UNCONFIGURED_REASON";
  assert.throws(
    () => policy.buildDraft(unsupportedReason),
    /reasonCode is unsupported/,
  );

  const unsafeEvidence = clone(base);
  unsafeEvidence.orderLifecycle.evidence = {
    providerPayload: { secret: "unsafe" },
  };
  assert.throws(
    () => policy.buildDraft(unsafeEvidence),
    /must not contain credentials/,
  );

  const noIdentity = clone(base);
  noIdentity.authData = { tokenType: "access" };
  assert.throws(
    () => policy.buildDraft(noIdentity),
    /authenticated requester identity/,
  );

  console.log("Order lifecycle request foundation contract validated");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
