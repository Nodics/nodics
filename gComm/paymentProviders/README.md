# Payment Providers

`paymentProviders` is the provider-family boundary for payment service
providers such as Stripe, PayPal, CyberSource, Visa, local acquirers, wallet
providers, and customer-specific gateways.

The important ownership split is simple:

- `gComm/payment` owns payment methods, provider metadata, payment
  transactions, authorization, capture, void, refund, reconciliation policy,
  idempotency, safe evidence, and BackOffice visibility.
- `gComm/paymentProviders/*Provider` modules own provider-specific adapter
  translation only.

Business users should still operate payments through Payment Operations in
Axis. Developers add or replace provider modules when a project needs a new
payment partner.

Provider modules do not make a provider active by themselves. They contribute
adapter capability and safe defaults. The effective business configuration is
resolved by Payment from governed `paymentProvider` records and optional
`paymentProviderExecutionPolicy` records first, then module defaults. This
allows Axis to customize provider availability, methods, operations, connector
references, lifecycle status, capture strategy, retry policy, and failover
behavior without editing provider module source.

Provider modules also do not expose BackOffice lifecycle routes. Axis executes
provider validation, sandbox tests, activation, suspension, and connector
rotation requests through the Payment-owned lifecycle endpoint. The provider
module adapter is called only after Payment policy, permission, idempotency, and
safe-field governance have approved the operation.

## Built-in provider modules

The first built-in provider modules are mocked contract adapters. They follow
public provider concepts without making live network calls:

- `stripeProvider` models PaymentIntent-style authorization, capture, cancel,
  refund, and retrieval/reconciliation evidence.
- `paypalProvider` models order/authorization/capture/refund concepts.
- `cyberSourceProvider` models authorization, capture, authorization reversal,
  refund, and transaction-detail reconciliation concepts.
- `visaProvider` is intentionally modeled as a network/product adapter
  placeholder because Visa integrations are product-specific and are not always
  a normal merchant PSP.

These modules are safe for deterministic framework tests. Production
integration requires a project/customer module to provide a real transport,
secret references, PSP-specific retry/timeout/failover rules, webhook
verification, and live sandbox evidence.

## Execution governance

`DefaultPaymentProviderExecutionGovernanceService` builds the provider-family
execution plan that Payment passes to adapters as `providerExecutionPlan`.
Provider adapters can read this plan, but they must not mutate Payment
transaction lifecycle directly.

The plan contains only safe policy:

- timeout in milliseconds;
- bounded maximum attempts;
- retry strategy and retryable failure codes;
- failover enablement and safe failover provider codes;
- whether live provider calls are enabled;
- reconciliation scheduling hints.

It is intentionally not a secret/connector payload. API keys, client secrets,
webhook secrets, raw gateway payloads, PAN, CVV, and provider credentials remain
outside this module family.

The service does not run background jobs. Long-running retry, failover,
reconciliation, webhook repair, or manual approval flows should be owned by
Workflow/runtime processes that call Payment-owned APIs with idempotency keys.

## Extension path

To add a provider:

1. Create a later-loaded project module such as
   `myProject/paymentProviders/acmePayProvider`.
2. Add an adapter service implementing `authorize`, `capture`, `void`,
   `refund`, and `reconcile`.
3. Contribute provider metadata through layered
   `payment.paymentPolicy.providers`.
4. Optionally contribute or create governed `paymentProviderExecutionPolicy`
   records for capture, retry, reconciliation, and failover behavior.
5. Register the adapter with `DefaultPaymentProviderGatewayService` during
   module `postInit`.
6. Run the provider adapter conformance contract and Payment foundation tests.

Do not add provider-specific behavior to Cart, Order, Axis, or the Payment
transaction schema. Payment remains the authority and the provider module stays
an adapter.
