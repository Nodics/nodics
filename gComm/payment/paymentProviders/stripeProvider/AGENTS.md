# Stripe Provider Agent Contract

- Follow the provider-family contract: `../AGENTS.md`.
- Follow the payment-family contract: `../../AGENTS.md`.
- Follow the commerce group contract: `../../../AGENTS.md`.
- Follow the root Nodics AI contract: `../../../../AGENTS.md`.
- Follow global AI-tool guidance: `../../../../gSetup/llm/ai-enablement-index.md`.
- Own only Stripe protocol translation and safe adapter registration.
- Do not store Stripe credentials, webhook secrets, raw PaymentIntent payloads,
  PAN, or CVV in configuration, schemas, logs, or returned evidence.
- Keep live calls disabled until a customer/environment module provides guarded
  transport, secret references, retry policy, and live sandbox evidence.
