# Payment Provider Core

`paymentProviderCore` owns the shared provider-family runtime contracts used by
Payment and provider adapter modules.

It provides:

- the common provider adapter operation contract;
- safe payment-provider evidence normalization;
- execution-governance policy for timeout, retry, failover, live-call gating,
  and reconciliation hints;
- conformance tests for provider adapter modules.

It does not own payment transaction lifecycle. Payment Core owns authorization,
capture, void, refund, reconciliation, idempotency, and BackOffice lifecycle
operations. Individual provider modules, such as Stripe or PayPal adapters, own
provider-specific protocol translation only.

Customer modules can replace these services or layer policy configuration, but
must preserve Payment-owned authority and secret-safe evidence boundaries.
