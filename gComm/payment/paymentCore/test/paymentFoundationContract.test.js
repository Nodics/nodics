/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module payment/test/paymentFoundationContract
 * @description Protects Payment as the owner of provider metadata, transaction evidence, exact money policy, and safe payment lifecycle boundaries.
 * @layer test
 * @owner payment
 * @override Project modules may customize providers and payment policy without moving gateway logic into Cart or Order.
 */
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const properties = require("../config/properties");
const routers = require("../src/router/routers");
const schemas = require("../src/schemas/schemas");
const interceptors = require("../src/interceptors/interceptors");
const lifecycleController = require("../src/controller/provider/defaultPaymentProviderLifecycleController");
const lifecycleFacade = require("../src/facade/provider/defaultPaymentProviderLifecycleFacade");
const policyService = require("../src/service/policy/defaultPaymentPolicyService");
const methodPolicyService = require("../src/service/provider/defaultPaymentMethodPolicyService");
const providerRegistryService = require("../src/service/provider/defaultPaymentProviderRegistryService");
const providerPolicyService = require("../src/service/provider/defaultPaymentProviderPolicyService");
const connectorPolicyService = require("../src/service/provider/defaultPaymentProviderConnectorPolicyService");
const gatewayService = require("../src/service/provider/defaultPaymentProviderGatewayService");
const lifecycleService = require("../src/service/provider/defaultPaymentProviderLifecycleService");
const manualProviderAdapterService = require("../src/service/provider/defaultManualPaymentProviderAdapterService");
const cardProviderAdapterService = require("../src/service/provider/defaultCardPaymentProviderAdapterService");
const deferredProviderAdapterService = require("../src/service/provider/defaultDeferredPaymentProviderAdapterService");
const providerExecutionGovernanceService = require("../../paymentProviders/paymentProviderCore/src/service/adapter/defaultPaymentProviderExecutionGovernanceService");
const statusDefinitions = require("../src/utils/statusDefinitions");
const defaultMethodData = require("../data/init/data/defaultPaymentMethodData");
const defaultProviderData = require("../data/init/data/defaultPaymentProviderData");
const methodHeader = require("../data/init/header/defaultPaymentMethodHeader");
const providerHeader = require("../data/init/header/defaultPaymentProviderHeader");
const initManifest = require("../data/init/manifest.json");

global.CONFIG = {
  get: (key) => {
    if (key === "payment") return properties.payment;
    if (key === "paymentProviders") {
      return {
        liveProviderCallsEnabled: false,
        resilience: {
          timeoutMs: 30000,
          maximumAttempts: 3,
          retryStrategy: "NONE",
          failoverEnabled: false,
          retryableFailureCodes: ["TIMEOUT", "RATE_LIMIT"],
        },
        reconciliation: {
          enabled: false,
          schedulerCode: "payment-provider-reconciliation",
          delayMinutes: 15,
        },
      };
    }
    return undefined;
  },
};
global.CLASSES = {
  NodicsError: class NodicsError extends Error {
    constructor(message, cause, code) {
      super(String(message));
      this.cause = cause;
      this.code = code;
    }
  },
};
global.SERVICE = {
  DefaultPaymentPolicyService: policyService,
  DefaultPaymentMethodPolicyService: methodPolicyService,
  DefaultPaymentProviderRegistryService: providerRegistryService,
  DefaultPaymentProviderPolicyService: providerPolicyService,
  DefaultPaymentProviderConnectorPolicyService: connectorPolicyService,
  DefaultPaymentProviderGatewayService: gatewayService,
  DefaultPaymentProviderLifecycleService: lifecycleService,
  DefaultPaymentProviderExecutionGovernanceService:
    providerExecutionGovernanceService,
  DefaultManualPaymentProviderAdapterService: manualProviderAdapterService,
  DefaultCardPaymentProviderAdapterService: cardProviderAdapterService,
  DefaultDeferredPaymentProviderAdapterService: deferredProviderAdapterService,
};
global.FACADE = {
  DefaultPaymentProviderLifecycleFacade: lifecycleFacade,
};

const governedProviderRecords = [
  Object.assign({}, defaultProviderData.defaultCardProvider, {
    displayName: "Enterprise Card Provider",
    adapterService: "DefaultManualPaymentProviderAdapterService",
    connectorCode: "enterprise-card-connector",
    configurationSource: "GOVERNED_RECORD",
  }),
];

const governedExecutionPolicyRecords = [
  {
    enterpriseCode: "default",
    policyCode: "default-card-authorize-policy",
    providerCode: "defaultCardProvider",
    methodCode: "CARD",
    operation: "AUTHORIZE",
    priority: 10,
    status: "ACTIVE",
    captureStrategy: "MANUAL_CAPTURE",
    authorizationTtlMinutes: 30,
    retryStrategy: "EXPONENTIAL_BACKOFF",
    timeoutMs: 12000,
    maxRetries: 2,
    retryableFailureCodes: ["TIMEOUT"],
    failoverEnabled: true,
    failoverProviderCodes: ["manualPaymentProvider"],
    reconciliationRequired: true,
    reconciliationDelayMinutes: 5,
    connectorCode: "enterprise-card-policy-connector",
    configRef: "paymentPolicies.defaultCardAuthorize",
    secret: "must-not-leak",
    rawGatewayPayload: { must: "not-leak" },
  },
];

global.SERVICE.DefaultPaymentProviderService = {
  get: async function (request) {
    let query = request.query || {};
    return {
      result: governedProviderRecords.filter((record) => {
        return Object.keys(query).every((key) => record[key] === query[key]);
      }),
    };
  },
  save: async function (request) {
    global.__savedPaymentProvider = request.model;
    return { result: [request.model] };
  },
};

global.SERVICE.DefaultPaymentProviderExecutionPolicyService = {
  get: async function (request) {
    let query = request.query || {};
    return {
      result: governedExecutionPolicyRecords.filter((record) => {
        return Object.keys(query).every((key) => record[key] === query[key]);
      }),
    };
  },
};

assert.strictEqual(
  properties.payment.paymentPolicy.operations.includes("AUTHORIZE"),
  true,
);
assert.strictEqual(
  properties.payment.paymentPolicy.operations.includes("CAPTURE"),
  true,
);
assert.strictEqual(
  properties.payment.paymentPolicy.deferredPaymentModes.includes("COD"),
  true,
);
assert.strictEqual(
  properties.payment.paymentPolicy.operations.includes("VOID"),
  true,
);
assert.strictEqual(
  properties.payment.paymentPolicy.operations.includes("RECONCILE"),
  true,
);
assert.strictEqual(
  properties.payment.paymentPolicy.transactionStatuses.includes("RECONCILED"),
  true,
);
assert.strictEqual(
  properties.payment.paymentPolicy.providerStatuses.includes("SUSPENDED"),
  true,
);
assert.strictEqual(
  properties.payment.paymentPolicy.providerExecutionPolicyRecordLimit,
  25,
);
assert.strictEqual(
  properties.payment.paymentPolicy.connectorPolicy.rotationAuthority,
  "connector-secret-authority",
);
assert.strictEqual(
  properties.payment.paymentPolicy.methods.CARD.defaultProviderCode,
  "defaultCardProvider",
);
assert.strictEqual(
  properties.payment.paymentPolicy.providers.defaultCardProvider.adapterService,
  "DefaultCardPaymentProviderAdapterService",
);
assert.strictEqual(
  properties.payment.paymentPolicy.refundCalculation.defaultStrategy,
  "SUM_PAYMENT_ALLOCATIONS",
);
assert.strictEqual(
  properties.payment.paymentPolicy.refundCalculation
    .explicitAmountMustNotExceedEligible,
  true,
);
assert.strictEqual(
  properties.backofficeCapabilities.payment.navigation[0].id,
  "payment-operations",
);
assert.strictEqual(
  properties.backofficeCapabilities.payment.navigation[0].label,
  "Payment Operations",
);
assert.strictEqual(
  properties.backofficeCapabilities.payment.navigation[0].route,
  "/commerce/payments",
);
assert.strictEqual(
  properties.backofficeCapabilities.payment.navigation[0].workbenchTarget
    .schemaName,
  "paymentTransaction",
);
assert.strictEqual(
  properties.backofficeCapabilities.payment.navigation
    .find((item) => item.id === "payment-transactions")
    .lifecycleActions.some((action) => action.intent === "RETRY"),
  true,
);
assert.strictEqual(
  properties.backofficeCapabilities.payment.navigation
    .find((item) => item.id === "payment-providers")
    .lifecycleActions.some((action) => action.id === "create-payment-provider"),
  true,
);
assert.strictEqual(
  properties.backofficeCapabilities.payment.navigation
    .find((item) => item.id === "payment-providers")
    .lifecycleActions.some(
      (action) =>
        action.handlerAction ===
        "DefaultPaymentProviderLifecycleService.testProvider",
    ),
  true,
);
assert.strictEqual(
  properties.backofficeCapabilities.payment.navigation
    .find((item) => item.id === "payment-providers")
    .lifecycleActions.some(
      (action) =>
        action.handlerAction ===
        "DefaultPaymentProviderLifecycleService.requestConnectorRotation",
    ),
  true,
);
assert.strictEqual(
  properties.backofficeCapabilities.payment.navigation
    .find((item) => item.id === "payment-providers")
    .lifecycleActions.every(
      (action) => action.operationRoute === "/providers/lifecycle",
    ),
  true,
);
assert.deepStrictEqual(
  properties.backofficeCapabilities.payment.navigation
    .find((item) => item.id === "payment-providers")
    .workbenchPresentation.defaultColumns.slice(0, 4),
  ["providerCode", "displayName", "providerType", "methodCodes"],
);
assert.strictEqual(
  properties.backofficeCapabilities.payment.navigation
    .find((item) => item.id === "payment-providers")
    .workbenchPresentation.forbiddenFields.includes("apiKey"),
  true,
);
assert.strictEqual(
  properties.backofficeCapabilities.payment.navigation.find(
    (item) => item.id === "payment-provider-policies",
  ).workbenchTarget.schemaName,
  "paymentProviderExecutionPolicy",
);
assert.deepStrictEqual(
  properties.backofficeCapabilities.payment.navigation
    .find((item) => item.id === "payment-provider-policies")
    .workbenchPresentation.defaultColumns.slice(0, 4),
  ["policyCode", "providerCode", "methodCode", "operation"],
);
assert.strictEqual(
  properties.backofficeCapabilities.payment.navigation
    .find((item) => item.id === "payment-provider-policies")
    .workbenchPresentation.forbiddenFields.includes("rawGatewayPayload"),
  true,
);
assert.strictEqual(
  properties.backofficeCapabilities.payment.navigation.find(
    (item) => item.id === "payment-refunds-reconciliation",
  ).workbenchTarget.schemaName,
  "paymentTransaction",
);
assert.strictEqual(routers.payment.providerLifecycle.execute.secured, true);
assert.strictEqual(
  routers.payment.providerLifecycle.execute.permission,
  "payment.backoffice.manage",
);
assert.strictEqual(
  routers.payment.providerLifecycle.execute.key,
  "/providers/lifecycle",
);
assert.strictEqual(
  routers.payment.providerLifecycle.execute.controller,
  "DefaultPaymentProviderLifecycleController",
);

assert.strictEqual(schemas.payment.paymentMethod.router.enabled, false);
assert.strictEqual(schemas.payment.paymentMethod.service.enabled, true);
assert.strictEqual(schemas.payment.paymentProvider.router.enabled, false);
assert.strictEqual(
  schemas.payment.paymentProviderExecutionPolicy.router.enabled,
  false,
);
assert.strictEqual(schemas.payment.paymentTransaction.router.enabled, false);
assert.strictEqual(schemas.payment.paymentProvider.service.enabled, true);
assert.strictEqual(
  schemas.payment.paymentProviderExecutionPolicy.service.enabled,
  true,
);
assert.strictEqual(schemas.payment.paymentTransaction.service.enabled, true);
assert.strictEqual(
  schemas.payment.paymentMethod.indexes.common.enterpriseCode.enabled,
  true,
);
assert.strictEqual(
  schemas.payment.paymentMethod.indexes.common.methodCode.enabled,
  true,
);
assert.notStrictEqual(
  schemas.payment.paymentMethod.indexes.individual.methodCode.options &&
    schemas.payment.paymentMethod.indexes.individual.methodCode.options.unique,
  true,
);
assert.strictEqual(
  schemas.payment.paymentProvider.indexes.common.enterpriseCode.enabled,
  true,
);
assert.strictEqual(
  schemas.payment.paymentProvider.indexes.common.providerCode.enabled,
  true,
);
assert.notStrictEqual(
  schemas.payment.paymentProvider.indexes.individual.providerCode.options &&
    schemas.payment.paymentProvider.indexes.individual.providerCode.options
      .unique,
  true,
);
assert.strictEqual(
  schemas.payment.paymentMethod.definition.providerRequired.type,
  "bool",
);
assert.strictEqual(
  schemas.payment.paymentMethod.definition.gatewayRequired.type,
  "bool",
);
assert.strictEqual(
  schemas.payment.paymentTransaction.definition.amount.type,
  "string",
);
assert.strictEqual(
  schemas.payment.paymentTransaction.definition.providerTransactionRef.required,
  false,
);
assert.strictEqual(
  schemas.payment.paymentTransaction.definition.rawGatewayPayload,
  undefined,
);
assert.strictEqual(
  schemas.payment.paymentTransaction.definition.cardNumber,
  undefined,
);
assert.strictEqual(
  schemas.payment.paymentProvider.definition.secret,
  undefined,
);
assert.strictEqual(
  schemas.payment.paymentProvider.definition.adapterService.required,
  true,
);
assert.strictEqual(
  schemas.payment.paymentProvider.definition.configurationSource.type,
  "string",
);
assert.strictEqual(
  schemas.payment.paymentProvider.definition.businessEditable.type,
  "bool",
);
assert.strictEqual(
  schemas.payment.paymentProviderExecutionPolicy.definition.policyCode.required,
  true,
);
assert.strictEqual(
  schemas.payment.paymentProviderExecutionPolicy.definition.providerCode
    .required,
  true,
);
assert.strictEqual(
  schemas.payment.paymentProviderExecutionPolicy.definition.captureStrategy
    .type,
  "string",
);
assert.strictEqual(
  schemas.payment.paymentProviderExecutionPolicy.definition.secret,
  undefined,
);
assert.strictEqual(
  schemas.payment.paymentProviderExecutionPolicy.definition.rawGatewayPayload,
  undefined,
);
assert.strictEqual(statusDefinitions.SUC_PAY_00001.code, "200");
assert.strictEqual(statusDefinitions.ERR_PAY_00009.code, "400");
assert.strictEqual(statusDefinitions.ERR_PAY_00010.code, "400");

assert.strictEqual(
  interceptors.paymentMethodPreSavePolicy.handler,
  "DefaultPaymentPolicyService.prepareMethod",
);
assert.strictEqual(
  interceptors.paymentProviderPreSavePolicy.handler,
  "DefaultPaymentPolicyService.prepareProvider",
);
assert.strictEqual(
  interceptors.paymentTransactionPreSavePolicy.handler,
  "DefaultPaymentPolicyService.prepareTransaction",
);
assert.strictEqual(
  interceptors.paymentTransactionPreRemovePolicy.handler,
  "DefaultPaymentPolicyService.rejectHardDelete",
);

assert.strictEqual(policyService.validateMoney("100"), true);
assert.strictEqual(policyService.validateMoney("100.25"), true);
assert.strictEqual(policyService.validateMoney(100.25), false);
assert.strictEqual(policyService.validateMoney("01.25"), false);
assert.strictEqual(policyService.providerCode("CARD"), "defaultCardProvider");
assert.strictEqual(policyService.operation("COD"), "DEFER");
assert.strictEqual(policyService.successStatus("DEFER"), "DEFERRED");
assert.strictEqual(policyService.successStatus("CAPTURE"), "CAPTURED");
assert.strictEqual(policyService.successStatus("REFUND"), "REFUNDED");
assert.strictEqual(policyService.successStatus("VOID"), "VOIDED");
assert.strictEqual(policyService.successStatus("RECONCILE"), "RECONCILED");
assert.strictEqual(methodPolicyService.method("CARD").gatewayRequired, true);
assert.strictEqual(
  providerRegistryService
    .provider("defaultCardProvider")
    .methodCodes.includes("CARD"),
  true,
);
assert.strictEqual(
  providerPolicyService.resolve({
    transaction: { paymentModeCode: "CARD", operation: "AUTHORIZE" },
  }).adapterService,
  "DefaultCardPaymentProviderAdapterService",
);
assert.strictEqual(
  providerPolicyService.resolve({
    transaction: { paymentModeCode: "CARD", operation: "VOID" },
  }).adapterService,
  "DefaultCardPaymentProviderAdapterService",
);
assert.strictEqual(
  methodHeader.payment.paymentMethod.query.enterpriseCode,
  "$enterpriseCode",
);
assert.strictEqual(
  providerHeader.payment.paymentProvider.query.providerCode,
  "$providerCode",
);
assert.strictEqual(
  defaultMethodData.card.defaultProviderCode,
  "defaultCardProvider",
);
assert.strictEqual(
  defaultProviderData.defaultCardProvider.configurationSource,
  "MODULE_DEFAULT_SEED",
);
assert.strictEqual(
  initManifest.files["data/defaultPaymentProviderData.js"].length,
  64,
);
const customProviderAdapter = {
  authorize: async () => ({ status: "AUTHORIZED" }),
};
gatewayService.init();
gatewayService.register("customProvider", customProviderAdapter);
assert.strictEqual(
  gatewayService.adapter("MissingAdapterService", "customProvider"),
  customProviderAdapter,
);
gatewayService.unregister("customProvider");
assert.notStrictEqual(
  gatewayService.adapter("MissingAdapterService", "customProvider"),
  customProviderAdapter,
);

const readme = fs.readFileSync(path.join(__dirname, "../README.md"), "utf8");
[
  "Payment methods versus payment providers",
  "Payment module hierarchy",
  "How to add a payment method",
  "How to add a payment provider",
  "Provider policy and operation governance",
  "DefaultPaymentProviderGatewayService.register",
  "CustomerPayPalPaymentProviderAdapterService",
  "Secrets belong in the customer secret store",
].forEach((fragment) => {
  assert(
    readme.includes(fragment),
    "Payment README must document customization guidance: " + fragment,
  );
});

const method = policyService.prepareMethod({
  model: {
    enterpriseCode: "enterpriseA",
    methodCode: "PAYPAL",
    displayName: "PayPal",
    defaultOperation: "AUTHORIZE",
    providerRequired: true,
    gatewayRequired: true,
    defaultProviderCode: "paypalProvider",
    allowedProviderTypes: ["WALLET", "PROJECT_PROVIDER"],
  },
});
assert.strictEqual(method.status, "ACTIVE");

const provider = policyService.prepareProvider({
  model: {
    enterpriseCode: "enterpriseA",
    providerCode: "defaultCardProvider",
    providerType: "CARD_GATEWAY",
    displayName: "Default Card Provider",
    methodCodes: ["CARD"],
    operations: ["AUTHORIZE"],
    adapterService: "DefaultCardPaymentProviderAdapterService",
  },
});
assert.strictEqual(provider.status, "ACTIVE");
assert.strictEqual(provider.paymentModes[0], "CARD");
assert.strictEqual(provider.configurationSource, "GOVERNED_RECORD");
assert.strictEqual(provider.businessEditable, true);

assert.throws(
  () =>
    policyService.prepareProvider({
      model: {
        enterpriseCode: "enterpriseA",
        providerCode: "badProvider",
        providerType: "CARD_GATEWAY",
        displayName: "Bad",
        methodCodes: ["CARD"],
        operations: ["AUTHORIZE"],
        adapterService: "DefaultCardPaymentProviderAdapterService",
        secret: "never-store-this",
      },
    }),
  (error) =>
    error.code === "ERR_PAY_00001" &&
    error.message.includes("must not store raw credentials"),
);

assert.throws(
  () =>
    policyService.prepareProvider({
      model: {
        enterpriseCode: "enterpriseA",
        providerCode: "badProvider",
        providerType: "CARD_GATEWAY",
        displayName: "Bad",
        methodCodes: ["CARD"],
        operations: ["AUTHORIZE"],
        adapterService: "DefaultCardPaymentProviderAdapterService",
        status: "BROKEN",
      },
    }),
  (error) =>
    error.code === "ERR_PAY_00001" &&
    error.message.includes("status is unsupported"),
);

assert.throws(
  () =>
    policyService.prepareProvider({
      model: {
        enterpriseCode: "enterpriseA",
        providerCode: "badProvider",
        providerType: "CARD_GATEWAY",
        displayName: "Bad",
        methodCodes: ["CARD"],
        operations: ["AUTHORIZE"],
        adapterService: "DefaultCardPaymentProviderAdapterService",
        apiKey: "never-store-this",
      },
    }),
  (error) =>
    error.code === "ERR_PAY_00001" &&
    error.message.includes("must not store raw credentials"),
);

assert.throws(
  () =>
    policyService.prepareTransaction({
      model: {
        enterpriseCode: "enterpriseA",
        transactionCode: "tx-1",
        idempotencyKey: "idem-1",
        providerCode: "defaultCardProvider",
        paymentModeCode: "CARD",
        paymentGroupCode: "card-main",
        operation: "AUTHORIZE",
        amount: 0.1 + 0.2,
        currencyCode: "USD",
      },
    }),
  (error) =>
    error.code === "ERR_PAY_00001" &&
    error.message.includes("exact non-negative decimal string"),
);

assert.throws(
  () =>
    policyService.prepareTransaction({
      model: {
        enterpriseCode: "enterpriseA",
        transactionCode: "tx-2",
        idempotencyKey: "idem-2",
        providerCode: "defaultCardProvider",
        paymentModeCode: "CARD",
        paymentGroupCode: "card-main",
        operation: "REFUND",
        amount: "1.00",
        currencyCode: "USD",
        rawGatewayPayload: { token: "never-store" },
      },
    }),
  (error) =>
    error.code === "ERR_PAY_00001" &&
    error.message.includes("raw provider payloads"),
);

const baseTransaction = {
  enterpriseCode: "enterpriseA",
  transactionCode: "tx-card-1",
  idempotencyKey: "idem-card-1",
  providerCode: "defaultCardProvider",
  paymentModeCode: "CARD",
  paymentGroupCode: "card-main",
  amount: "10.00",
  currencyCode: "USD",
};

(async () => {
  let effectiveProvider = await providerRegistryService.providerForRequest(
    "defaultCardProvider",
    {
      enterpriseCode: "default",
    },
  );
  assert.strictEqual(effectiveProvider.displayName, "Enterprise Card Provider");
  assert.strictEqual(effectiveProvider.configurationSource, "GOVERNED_RECORD");
  assert.strictEqual(
    effectiveProvider.connectorCode,
    "enterprise-card-connector",
  );

  let effectivePolicy = await providerPolicyService.resolveForRequest({
    enterpriseCode: "default",
    transaction: Object.assign({}, baseTransaction, { operation: "AUTHORIZE" }),
  });
  assert.strictEqual(
    effectivePolicy.adapterService,
    "DefaultManualPaymentProviderAdapterService",
  );
  assert.strictEqual(
    effectivePolicy.configurationSource,
    "GOVERNED_EXECUTION_POLICY",
  );
  assert.strictEqual(
    effectivePolicy.executionPolicyCode,
    "default-card-authorize-policy",
  );
  assert.strictEqual(effectivePolicy.captureStrategy, "MANUAL_CAPTURE");
  assert.strictEqual(effectivePolicy.retryStrategy, "EXPONENTIAL_BACKOFF");
  assert.strictEqual(effectivePolicy.timeoutMs, 12000);
  assert.strictEqual(effectivePolicy.maxRetries, 2);
  assert.deepStrictEqual(effectivePolicy.retryableFailureCodes, ["TIMEOUT"]);
  assert.strictEqual(effectivePolicy.failoverEnabled, true);
  assert.deepStrictEqual(effectivePolicy.failoverProviderCodes, [
    "manualPaymentProvider",
  ]);
  assert.strictEqual(effectivePolicy.reconciliationRequired, true);
  assert.strictEqual(effectivePolicy.reconciliationDelayMinutes, 5);
  assert.strictEqual(
    effectivePolicy.connectorCode,
    "enterprise-card-policy-connector",
  );
  assert.strictEqual(effectivePolicy.secret, undefined);
  assert.strictEqual(effectivePolicy.rawGatewayPayload, undefined);

  let validation = await lifecycleService.validateProvider({
    enterpriseCode: "default",
    providerCode: "defaultCardProvider",
  });
  assert.strictEqual(validation.valid, true);
  assert.strictEqual(validation.secretsStoredInPayment, false);
  assert.strictEqual(validation.credentialsResolved, false);

  assert.throws(
    () =>
      connectorPolicyService.validateProvider({
        providerCode: "unsafe",
        providerType: "CARD_GATEWAY",
        connectorCode: "stripe-secret-key",
        methodCodes: ["CARD"],
        operations: ["AUTHORIZE"],
      }),
    (error) =>
      error.code === "ERR_PAY_00010" &&
      error.message.includes("credential-like"),
  );

  let testRun = await lifecycleService.testProvider({
    enterpriseCode: "default",
    providerCode: "defaultCardProvider",
  });
  assert.strictEqual(testRun.valid, true);
  assert.strictEqual(testRun.testStatus, "RECONCILED");

  let suspended = await lifecycleService.suspendProvider({
    enterpriseCode: "default",
    providerCode: "defaultCardProvider",
  });
  assert.strictEqual(suspended.status, "SUSPENDED");
  assert.strictEqual(global.__savedPaymentProvider.status, "SUSPENDED");

  let rotation = await lifecycleService.requestConnectorRotation({
    enterpriseCode: "default",
    providerCode: "defaultCardProvider",
  });
  assert.strictEqual(rotation.rotationAuthority, "connector-secret-authority");

  let executed = await lifecycleService.execute({
    actionId: "test-payment-provider",
    providerCode: "defaultCardProvider",
    enterpriseCode: "default",
  });
  assert.strictEqual(executed.actionId, "test-payment-provider");
  assert.strictEqual(
    executed.handlerAction,
    "DefaultPaymentProviderLifecycleService.testProvider",
  );
  assert.strictEqual(executed.valid, true);

  await assert.rejects(
    () =>
      lifecycleService.execute({
        actionId: "delete-secrets",
        providerCode: "defaultCardProvider",
        enterpriseCode: "default",
      }),
    (error) =>
      error.code === "ERR_PAY_00009" && error.message.includes("unsupported"),
  );

  let envelope = await lifecycleFacade.execute({
    actionId: "validate-payment-provider",
    providerCode: "defaultCardProvider",
    enterpriseCode: "default",
  });
  assert.strictEqual(envelope.code, "SUC_PAY_00001");
  assert.strictEqual(envelope.data.actionId, "validate-payment-provider");

  let controllerEnvelope = await lifecycleController.execute({
    tenant: { code: "default" },
    authData: { userId: "admin" },
    entCode: "default",
    httpRequest: {
      body: {
        actionId: "request-provider-connector-rotation",
        providerCode: "defaultCardProvider",
      },
    },
  });
  assert.strictEqual(
    controllerEnvelope.data.actionId,
    "request-provider-connector-rotation",
  );
  assert.strictEqual(
    controllerEnvelope.data.rotationAuthority,
    "connector-secret-authority",
  );

  let suspendedProvider = providerRegistryService.normalizeRecord(
    {
      providerCode: "defaultCardProvider",
      providerType: "CARD_GATEWAY",
      displayName: "Suspended",
      methodCodes: ["CARD"],
      operations: ["AUTHORIZE"],
      adapterService: "DefaultCardPaymentProviderAdapterService",
      status: "SUSPENDED",
    },
    properties.payment.paymentPolicy.providers.defaultCardProvider,
  );
  assert.throws(
    () =>
      providerRegistryService.assertSupports(
        suspendedProvider,
        "CARD",
        "AUTHORIZE",
      ),
    (error) =>
      error.code === "ERR_PAY_00007" && error.message.includes("not active"),
  );

  let authorized = await gatewayService.authorize({
    enterpriseCode: "default",
    transaction: Object.assign({}, baseTransaction, { operation: "AUTHORIZE" }),
  });
  assert.strictEqual(authorized.status, "AUTHORIZED");
  let plan = providerExecutionGovernanceService.executionPlan({
    transaction: Object.assign({}, baseTransaction, { operation: "AUTHORIZE" }),
    providerPolicy: effectivePolicy,
  });
  assert.strictEqual(plan.timeoutMs, 12000);
  assert.strictEqual(plan.maximumAttempts, 3);
  assert.strictEqual(plan.retryStrategy, "EXPONENTIAL_BACKOFF");
  assert.strictEqual(plan.failoverEnabled, true);
  assert.deepStrictEqual(plan.failoverProviderCodes, ["manualPaymentProvider"]);
  assert.strictEqual(plan.reconciliation.enabled, true);
  assert.strictEqual(plan.reconciliation.delayMinutes, 5);
  assert.strictEqual(
    plan.reconciliation.idempotencyKey,
    "payment-reconcile::defaultCardProvider::tx-card-1",
  );

  let captured = await gatewayService.capture({
    transaction: Object.assign({}, baseTransaction, { operation: "CAPTURE" }),
  });
  assert.strictEqual(captured.status, "CAPTURED");
  assert.strictEqual(captured.providerTransactionRef, "captured::tx-card-1");

  let voided = await gatewayService.void({
    transaction: Object.assign({}, baseTransaction, { operation: "VOID" }),
  });
  assert.strictEqual(voided.status, "VOIDED");

  let reconciled = await gatewayService.reconcile({
    transaction: Object.assign({}, baseTransaction, { operation: "RECONCILE" }),
  });
  assert.strictEqual(reconciled.status, "RECONCILED");

  let refunded = await gatewayService.refund({
    transaction: Object.assign({}, baseTransaction, { operation: "REFUND" }),
  });
  assert.strictEqual(refunded.status, "REFUNDED");

  await assert.rejects(
    () =>
      gatewayService.capture({
        transaction: Object.assign({}, baseTransaction, {
          operation: "AUTHORIZE",
        }),
      }),
    (error) =>
      error.code === "ERR_PAY_00002" &&
      error.message.includes("CAPTURE transaction evidence"),
  );

  console.log("Payment foundation contract validated");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
