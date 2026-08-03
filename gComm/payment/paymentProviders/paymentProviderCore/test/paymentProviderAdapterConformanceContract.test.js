/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module paymentProviderCore/test/paymentProviderAdapterConformanceContract
 * @description Protects Stripe, PayPal, CyberSource, and Visa provider modules against the Payment-owned adapter contract.
 * @layer test
 * @owner paymentProviderCore
 * @override Project provider modules must pass this same provider-neutral adapter contract without moving payment authority out of Payment.
 */
const assert = require("assert");
const contract = require("../src/service/adapter/defaultPaymentProviderAdapterContractService");
const gateway = require("../../../paymentCore/src/service/provider/defaultPaymentProviderGatewayService");
const stripe = require("../../stripeProvider/src/service/defaultStripePaymentProviderAdapterService");
const paypal = require("../../paypalProvider/src/service/defaultPaypalPaymentProviderAdapterService");
const cyberSource = require("../../cyberSourceProvider/src/service/defaultCyberSourcePaymentProviderAdapterService");
const visa = require("../../visaProvider/src/service/defaultVisaPaymentProviderAdapterService");
const stripeProperties = require("../../stripeProvider/config/properties");
const paypalProperties = require("../../paypalProvider/config/properties");
const cyberSourceProperties = require("../../cyberSourceProvider/config/properties");
const visaProperties = require("../../visaProvider/config/properties");
const paymentProvidersPackage = require("../../package.json");
const paymentProviderCorePackage = require("../package.json");
const stripePackage = require("../../stripeProvider/package.json");
const paypalPackage = require("../../paypalProvider/package.json");
const cyberSourcePackage = require("../../cyberSourceProvider/package.json");
const visaPackage = require("../../visaProvider/package.json");

const providers = {
  stripeProvider: {
    adapter: stripe,
    properties: stripeProperties,
    package: stripePackage,
    expectedFamily: "STRIPE",
  },
  paypalProvider: {
    adapter: paypal,
    properties: paypalProperties,
    package: paypalPackage,
    expectedFamily: "PAYPAL",
  },
  cyberSourceProvider: {
    adapter: cyberSource,
    properties: cyberSourceProperties,
    package: cyberSourcePackage,
    expectedFamily: "CYBERSOURCE",
  },
  visaProvider: {
    adapter: visa,
    properties: visaProperties,
    package: visaPackage,
    expectedFamily: "VISA",
  },
};

const baseTransaction = {
  transactionCode: "payment-provider-conformance-1",
  idempotencyKey: "payment-provider-conformance-key-1",
  paymentModeCode: "CARD",
  paymentGroupCode: "payment-group-1",
  amount: "10.00",
  currencyCode: "USD",
};

function request(providerCode, operation) {
  return {
    transaction: Object.assign({}, baseTransaction, {
      providerCode: providerCode,
      operation: operation,
    }),
    providerPolicy: {
      providerCode: providerCode,
      operation: operation,
      adapterService:
        providers[providerCode].properties.payment.paymentPolicy.providers[
          providerCode
        ].adapterService,
    },
    context: {
      tenantCode: "tenantA",
      enterpriseCode: "enterpriseA",
    },
  };
}

const expectedStatuses = {
  AUTHORIZE: "AUTHORIZED",
  CAPTURE: "CAPTURED",
  VOID: "VOIDED",
  REFUND: "REFUNDED",
  RECONCILE: "RECONCILED",
};

async function assertOperation(providerCode, adapter, operation, methodName) {
  const result = contract.normalizeResult(
    await adapter[methodName](request(providerCode, operation)),
  );
  assert.strictEqual(result.providerCode, providerCode);
  assert.strictEqual(
    result.providerFamily,
    providers[providerCode].expectedFamily,
  );
  assert.strictEqual(result.operation, operation);
  assert.strictEqual(result.status, expectedStatuses[operation]);
  assert(result.providerTransactionRef.startsWith(providerCode + "::"));
  assert.strictEqual(result.rawGatewayPayload, undefined);
  assert.strictEqual(result.secret, undefined);
}

(async () => {
  assert.strictEqual(paymentProvidersPackage.nodics.kind, "group");
  assert.strictEqual(paymentProvidersPackage.nodics.runtime.router, false);
  assert.strictEqual(
    paymentProvidersPackage.nodics.owns.includes("service"),
    false,
  );
  assert.strictEqual(
    paymentProvidersPackage.nodics.owns.includes("test"),
    false,
  );
  assert.strictEqual(paymentProviderCorePackage.nodics.kind, "capability");
  assert.strictEqual(
    paymentProviderCorePackage.nodics.owns.includes("service"),
    true,
  );
  assert.strictEqual(
    paymentProviderCorePackage.nodics.owns.includes("test"),
    true,
  );

  Object.entries(providers).forEach(([providerCode, provider]) => {
    assert.strictEqual(provider.package.nodics.kind, "capability");
    assert.strictEqual(provider.package.nodics.runtime.router, false);
    assert.strictEqual(provider.package.nodics.runtime.web, false);
    assert.strictEqual(provider.package.nodics.owns.includes("service"), true);
    assert.strictEqual(
      provider.package.nodics.owns.includes("configuration"),
      true,
    );
    contract.validate(providerCode, provider.adapter);
    const configured =
      provider.properties.payment.paymentPolicy.providers[providerCode];
    assert.strictEqual(configured.providerCode, providerCode);
    assert.strictEqual(configured.adapterService.length > 0, true);
    assert.strictEqual(configured.operations.includes("AUTHORIZE"), true);
    assert.strictEqual(configured.operations.includes("RECONCILE"), true);
    assert.strictEqual(
      provider.properties.paymentProviders[providerCode].mode,
      "MOCK_CONTRACT",
    );
  });

  for (const [providerCode, provider] of Object.entries(providers)) {
    await assertOperation(
      providerCode,
      provider.adapter,
      "AUTHORIZE",
      "authorize",
    );
    await assertOperation(providerCode, provider.adapter, "CAPTURE", "capture");
    await assertOperation(providerCode, provider.adapter, "VOID", "void");
    await assertOperation(providerCode, provider.adapter, "REFUND", "refund");
    await assertOperation(
      providerCode,
      provider.adapter,
      "RECONCILE",
      "reconcile",
    );
  }

  gateway.init();
  gateway.register("stripeProvider", stripe);
  assert.strictEqual(
    gateway.adapter("MissingService", "stripeProvider"),
    stripe,
  );
  gateway.unregister("stripeProvider");
  assert.notStrictEqual(
    gateway.adapter("MissingService", "stripeProvider"),
    stripe,
  );

  console.log("Payment provider adapter conformance contract validated");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
