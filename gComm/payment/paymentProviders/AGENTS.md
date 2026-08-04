# Payment Providers Agent Contract

Follow the root Nodics contract: `../../../AGENTS.md`.
Follow the commerce group contract: `../../AGENTS.md`.
Follow the payment family contract: `../AGENTS.md`.
Follow global AI/development guidance: `../../../gSetup/llm/ai-enablement-index.md`.

- `paymentProviders` owns the provider-family extension boundary for external
  payment service providers. It does not own payment methods, transactions,
  checkout decisions, refunds, reconciliation state, or Axis navigation.
- `gComm/payment/paymentCore` remains the payment authority. Provider modules register
  adapter services with Payment and contribute layered provider defaults only.
- Individual provider modules own protocol translation, mocked/sandbox
  contract behavior, normalized evidence, and documentation for that provider.
  They must not select themselves, store secrets, mutate Payment lifecycle
  directly, or bypass Payment-owned gateway/policy services.
- Provider adapters must implement the common operations contract:
  `authorize`, `capture`, `void`, `refund`, and `reconcile`.
- Provider adapters may simulate public provider contracts for deterministic
  framework tests, but real PSP calls require environment/customer-owned
  connector configuration, guarded live-provider tests, and secret handling.
- Never store raw PAN, CVV, provider credentials, webhook secrets, or raw
  provider payloads in schemas, properties, test fixtures, logs, or returned
  evidence.
