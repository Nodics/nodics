# paymentCore Module

`paymentCore` owns payment provider contracts and payment transaction evidence
for Commerce checkout. Cart and Order can reference payment groups and payment
evidence, but gateway decisions, authorization, capture, refund, void, and
provider lifecycle belong here.

The physical module name is `paymentCore`, but the stable business/API namespace
remains `payment`. Schema keys, BackOffice routes, and service contracts keep
the `payment` capability name so existing clients do not break while the family
is organized as `payment/paymentCore`, `payment/paymentMethods`, and
`payment/paymentProviders`.

This first foundation slice provides:

- `paymentProvider` for configured provider identities and supported operations;
- `paymentTransaction` for safe authorization/capture/refund/void evidence;
- `DefaultPaymentPolicyService` for exact-money validation and transaction
  draft creation;
- `DefaultPaymentCheckoutAuthorizationService` for checkout payment-group
  authorization orchestration;
- `DefaultPaymentRefundService` for idempotent refund transaction evidence;
- Payment-owned refund recovery through `retryRefund` and `reconcileRefund`;
- `DefaultPaymentProviderGatewayService` as a replaceable provider boundary.

The default provider boundary is intentionally non-gateway. It returns safe
simulated evidence for modes configured as in-framework/manual/deferred. Real
projects replace the provider service or provider registry in customer modules.
Do not add provider secrets to schemas or properties.

Checkout placement should call Payment through a Workflow action. Order remains
the placement authority, while Payment remains the payment authority.

## Payment module hierarchy

Payment is the authority. Provider modules are adapters.

```text
gComm/payment
  Payment family group. Owns composition, documentation, and shared
  payment-family configuration only.

gComm/payment/paymentCore
  Owns payment metadata, transaction evidence, gateway policy, authorization,
  capture, void, refund, reconciliation, and BackOffice Payment Operations
  metadata.

gComm/payment/paymentMethods
  Owns method-family boundaries such as Card, Cash on Delivery, Wallet, and
  Bank Transfer.

gComm/payment/paymentProviders
  Owns the provider-family adapter contract and conformance tests.

gComm/payment/paymentProviders/stripeProvider
gComm/payment/paymentProviders/paypalProvider
gComm/payment/paymentProviders/cyberSourceProvider
gComm/payment/paymentProviders/visaProvider
  Own provider-specific protocol translation and mocked public-contract
  behavior only.
```

The built-in provider modules are deliberately mocked. They follow public
provider concepts such as Stripe PaymentIntents, PayPal authorizations and
captures, CyberSource authorization/capture/refund/reversal, and Visa
product-specific network operations, but they do not make live HTTP calls.

This gives developers a working adapter contract without requiring credentials
or unsafe test traffic. Production provider integration should be added by a
customer/project module that supplies real transport, guarded secret references,
retry/timeout/failover policy, webhook verification, reconciliation lookup, and
live sandbox evidence.

Do not put provider-specific execution directly in `gComm/payment` when a
provider module can register an adapter. Do not put provider execution in Cart,
Order, Axis, or checkout UI code.

## Checkout authorization

`DefaultPaymentCheckoutAuthorizationService` accepts produced order payment
groups from checkout placement. It builds one idempotent `paymentTransaction`
per payment group, delegates provider handling to
`DefaultPaymentProviderGatewayService`, and returns only safe evidence:
authorized transactions, deferred transactions, failures, and counts.

The default implementation supports distributed payment groups. For example,
one order can authorize a card payment group and defer a cash-on-delivery group
in the same checkout placement. Quantity-level relationships remain in
Order-owned `orderPaymentAllocation` records; Payment owns transaction
lifecycle evidence.

Customer modules customize payment by layering `payment.paymentPolicy` or
replacing Payment-owned services. They must not add card data, provider
credentials, raw gateway responses, or payment lifecycle logic to Cart or
Order.

## Refund transaction evidence

Refunds are Payment-owned transaction evidence. A return may be requested,
approved, picked up, and received by Fulfillment, but Payment owns the refund
operation against a payment provider or manual/deferred payment record.

`DefaultPaymentRefundService` builds one idempotent `paymentTransaction` with
operation `REFUND`, delegates safe provider handling to
`DefaultPaymentProviderGatewayService.refund`, and persists only safe evidence
such as transaction code, provider code, amount, currency, status, and provider
transaction reference. It rejects raw gateway payloads, card data, credentials,
and secrets.

Refund recovery also stays inside Payment. `retryRefund` reuses the same refund
idempotency key and transaction evidence. If the transaction is already
`REFUNDED`, it returns the existing safe evidence without calling the provider
again. If the transaction is still recoverable, such as `REQUESTED` or
`FAILED`, it retries through `DefaultPaymentProviderGatewayService.refund`,
updates Payment-owned recovery fields, and preserves the transaction identity.
`reconcileRefund` reads safe transaction evidence without calling the provider;
real PSP reconciliation can be layered by replacing Payment-owned services in a
customer module.

`DefaultPaymentRefundCalculationService` calculates the refundable amount before
provider refund execution. Order passes safe payment allocation evidence from
the reverse workflow, and Payment applies `payment.paymentPolicy.refundCalculation`
to decide the eligible amount, currency, allocation scope, and optional explicit
refund amount. This keeps split-payment and quantity-level refund rules in a
Payment-owned service instead of hiding them in Order or Axis.

For partial cancellation, Order supplies selected entry quantities and the
original quantity-level payment allocations. Payment applies
`PROPORTIONAL_ORIGINAL_PAYMENT_ALLOCATIONS`, validates exact quantities and
currency scale, rounds the aggregate at configured minor-unit scale, and
assigns any remainder deterministically by allocation identity. The result
retains safe per-allocation amount evidence so later Workflow execution can
route funds back through the original payment groups and providers. Calculation
does not create a transaction or call a gateway.

Approved Order cancellation executes through the module-internal
`payment.cancellationIntent.execute` contract. Payment reloads each original
transaction instead of trusting routing hints, preserves its provider, payment
method, currency, and parent transaction identity, and chooses `VOID` for
`AUTHORIZED` funds or `REFUND` for `CAPTURED`/`SETTLED` funds. Exact cumulative
reversals cannot exceed the original amount. Stable cancellation identity and
request version make completed calls replay-safe; conflicting replay evidence
is rejected for reconciliation.

Customer modules connect real PSP refund behavior by replacing the Payment
provider gateway, refund service, or refund calculation service. They should not
put refund logic in Order, Fulfillment, Cart, or frontend code. A full
return/refund business process should be coordinated through Workflow so
approvals, received goods, refund calculation, provider calls, notifications,
and compensation remain recoverable.

## Payment methods versus payment providers

A payment method is the business option offered during checkout. Examples are
`CARD`, `COD`, `WALLET`, `ADVANCE`, `OFFLINE`, or `ACCOUNT_CREDIT`.

A payment provider is the technical or operational authority that can execute a
method. Examples are CyberSource, Stripe, PayPal, a bank transfer process, a
wallet provider, a manual finance team, or a cash-on-delivery carrier process.

Keep those layers separate:

- methods answer “what can the customer choose?”;
- providers answer “who or what executes this choice?”;
- provider policy answers “is this provider allowed for this tenant,
  enterprise, country, currency, channel, amount, customer, risk context, and
  operation?”;
- provider adapters answer “how does Nodics call or simulate that provider
  safely?”.

The default implementation intentionally includes safe local/manual/deferred
adapters. Real PSPs must be added as customer/project provider adapters or
later provider modules. Do not put credentials, card numbers, CVV, raw gateway
payloads, or provider secrets in schemas, properties, transaction records, or
Axis.

## How to add a payment method

Add or override method policy through a later customer module by layering
`payment.paymentPolicy.methods`.

For example, a customer module can add `PAYPAL` without changing framework
source:

```js
module.exports = {
  payment: {
    paymentPolicy: {
      methods: {
        PAYPAL: {
          methodCode: "PAYPAL",
          displayName: "PayPal",
          defaultOperation: "AUTHORIZE",
          providerRequired: true,
          gatewayRequired: true,
          defaultProviderCode: "paypalProvider",
          allowedProviderTypes: ["WALLET", "PROJECT_PROVIDER"],
        },
      },
      defaultProviderByPaymentMode: {
        PAYPAL: "paypalProvider",
      },
    },
  },
};
```

If the method has enterprise-specific lifecycle or backoffice management needs,
create or update `paymentMethod` records through Payment-owned services. Do not
add a flat `paymentMethod` field to Cart or Order as a shortcut; Cart and Order
should keep payment group/allocation evidence and delegate payment behavior to
Payment.

## How to add a payment provider

Add provider metadata through layered `payment.paymentPolicy.providers` or
through governed `paymentProvider` records when the backend flow requires
editable provider lifecycle.

Axis Payment Operations manages the governed `paymentProvider` records. Those
records are the business-user configuration layer for provider availability,
display name, supported methods, supported operations, adapter reference, policy
service, connector code, status, and safe notes. The runtime provider registry
prefers a matching active governed record for the request enterprise, then falls
back to module configuration.

Axis also manages governed `paymentProviderExecutionPolicy` records through the
Provider Policies page. These records are the business-user configuration layer
for execution behavior: provider, method, operation, priority, capture strategy,
authorization time-to-live, retry strategy, max retries, failover provider
codes, and safe connector/config references. They are not credential records and
must never contain API keys, tokens, card data, webhook secrets, or raw gateway
payloads.

This split is deliberate:

- provider modules supply reusable adapter defaults;
- Payment owns the governed provider schema and runtime selection;
- Axis edits only safe provider metadata and safe execution policy;
- credentials, API keys, access tokens, webhooks, PAN, CVV, and raw gateway
  payloads remain in the secret or connector authority.

## Provider lifecycle in Axis

Payment Provider records are intentionally safe enough for Axis, but activation
still goes through Payment-owned lifecycle checks:

1. Create or edit a `paymentProvider` record with safe metadata only.
2. Validate the provider. Payment checks required fields, adapter availability,
   connector/config references, status, and unsafe-field governance.
3. Test the provider. Payment runs a safe normalized provider operation such as
   reconciliation or authorization evidence generation. Mock provider modules
   return deterministic evidence; customer modules may perform live sandbox
   probes through their connector layer.
4. Activate or suspend the provider. Runtime selection excludes draft,
   suspended, inactive, and retired providers.
5. Request connector rotation when credentials need to change. Payment returns a
   safe rotation request descriptor and never reads or writes the credential
   value itself.

`DefaultPaymentProviderLifecycleService` owns this flow. Axis should invoke the
backend-owned lifecycle action metadata rather than duplicating provider logic in
the client.

The executable BackOffice lifecycle endpoint is:

```text
POST /nodics/payment/v0/providers/lifecycle
```

Axis discovers this route from `backofficeCapabilities.payment.navigation`
metadata. Each lifecycle action declares an `id`, label, intent, permission, and
`operationRoute`. The client posts only the selected safe record identity and the
safe record model:

```json
{
  "actionId": "validate-payment-provider",
  "identity": { "providerCode": "stripeProvider" },
  "model": {
    "providerCode": "stripeProvider",
    "displayName": "Stripe Provider",
    "providerType": "CARD_GATEWAY"
  }
}
```

The Payment router, controller, facade, and
`DefaultPaymentProviderLifecycleService.execute` form the only supported
execution path. The service uses an explicit allow-list to map action ids to
safe handlers such as `validateProvider`, `testProvider`, `activateProvider`,
`suspendProvider`, and `requestConnectorRotation`. Adding an Axis button without
adding a Payment-owned allow-list handler must not execute anything.

Axis must hide and redact `workbenchPresentation.forbiddenFields` before
lifecycle execution. This prevents unsafe or customer-specific secrets from
being echoed back to Payment if a backend response accidentally contains them.
Payment still performs the final validation and must reject unsafe provider
fields server-side.

`DefaultPaymentProviderConnectorPolicyService` owns safe connector-reference
validation. It validates `connectorCode` and `configRef` only. Real credential
storage, rotation, webhook secrets, PSP certificates, and API tokens belong to a
customer connector or secret authority.

For example:

```js
module.exports = {
  payment: {
    paymentPolicy: {
      providers: {
        paypalProvider: {
          providerCode: "paypalProvider",
          providerType: "PROJECT_PROVIDER",
          displayName: "PayPal provider",
          methodCodes: ["PAYPAL"],
          operations: ["AUTHORIZE", "CAPTURE", "REFUND", "VOID"],
          adapterService: "CustomerPayPalPaymentProviderAdapterService",
          policyService: "CustomerPaymentProviderPolicyService",
          status: "ACTIVE",
        },
      },
    },
  },
};
```

Then add `CustomerPayPalPaymentProviderAdapterService` in the customer module.
The adapter should implement safe operation methods such as `authorize`,
`capture`, `void`, `refund`, and `reconcile` as required by the provider. It
must return normalized payment evidence only:

- transaction code;
- idempotency key;
- provider code;
- operation;
- status;
- safe provider transaction reference;
- safe failure code/message;
- retry/reconciliation metadata when applicable.

Secrets belong in the customer secret store or secure connector configuration.
Provider metadata may store a `configRef` or `connectorCode`, never raw
credentials.

For reusable provider products, prefer a provider child module under the
payment-provider hierarchy rather than adding large provider-specific logic to
Payment itself:

```text
myProject/payment/paymentProviders/acmePayProvider
  config/properties.js
  src/service/defaultAcmePayPaymentProviderAdapterService.js
  test/acmePayPaymentProviderAdapterContract.test.js
```

Register the adapter during module startup with
`DefaultPaymentProviderGatewayService.register('acmePayProvider', adapter)`.
The provider remains selectable only through Payment-owned provider policy and
Payment-owned transaction evidence.

## Provider policy and operation governance

`DefaultPaymentProviderPolicyService` builds the effective execution policy from
method, provider, operation, request context, and optional governed
`paymentProviderExecutionPolicy` records. The lookup is intentionally optional:
if no active enterprise policy exists, Payment uses module defaults; if a
matching policy exists, Payment merges only safe fields into the execution
policy.

Customer modules replace or extend this service when eligibility depends on:

- tenant or enterprise;
- country, currency, or channel;
- amount thresholds;
- customer type or risk score;
- provider health;
- retry/failover rules;
- payment operation such as `AUTHORIZE`, `CAPTURE`, `VOID`, `REFUND`, or
  `RECONCILE`.

The default policy match is scoped by provider and enterprise, then filtered by
optional method and operation. Lower `priority` wins. This lets a project define
a broad provider policy first and then add a more specific policy for a method
or operation without changing framework code.

`DefaultPaymentProviderGatewayService` is the single provider execution boundary
used by checkout authorization and refunds. Keep idempotency, timeout, retry,
safe failure mapping, and reconciliation behavior behind Payment-owned
services/adapters. Axis should only show actions that backend Payment metadata
and permissions expose.

Provider-family modules may contribute
`DefaultPaymentProviderExecutionGovernanceService`. Payment passes the generated
`providerExecutionPlan` into adapters so live PSP modules can read one safe
contract for:

- operation timeout;
- maximum attempts after provider-family caps are applied;
- retry strategy and retryable provider failure codes;
- failover eligibility and ordered failover provider codes;
- reconciliation scheduling hints and idempotency key.

The plan does not execute a hidden retry loop by itself. Actual retries,
failover, delayed reconciliation, and manual recovery are Workflow/runtime
responsibilities because they are long-running business processes. This avoids
turning one HTTP request into an unsafe multi-provider transaction while still
giving every provider adapter the same policy contract.
