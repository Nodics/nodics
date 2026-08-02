# PayPal Provider Agent Contract

- Follow the provider-family contract: `../AGENTS.md`.
- Follow the payment-family contract: `../../AGENTS.md`.
- Follow the commerce group contract: `../../../AGENTS.md`.
- Own only PayPal REST protocol translation and safe adapter registration.
- Do not store PayPal credentials, webhook secrets, raw order/capture payloads,
  PAN, or CVV in configuration, schemas, logs, or returned evidence.
- Keep live calls disabled until customer/environment configuration supplies a
  guarded transport and secret references.
