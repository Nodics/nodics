# Payment Provider Core Agent Contract

Follow the root Nodics contract: `../../../../AGENTS.md`.
Follow the commerce group contract: `../../../AGENTS.md`.
Follow the payment family contract: `../../AGENTS.md`.
Follow the payment providers family contract: `../AGENTS.md`.
Follow global AI/development guidance: `../../../../gSetup/llm/ai-enablement-index.md`.

- `paymentProviderCore` owns the shared provider adapter contract, safe evidence
  normalization, and provider execution-governance services.
- `paymentProviders` is only a provider-family group and must not own runtime
  services directly.
- Individual provider modules own provider-specific protocol translation only.
- Payment Core remains the authority for payment transaction lifecycle,
  authorization, capture, void, refund, reconciliation, and governed Axis
  operations.
- Never store raw PAN, CVV, provider credentials, webhook secrets, or raw
  provider payloads in schemas, config, logs, fixtures, or returned evidence.
