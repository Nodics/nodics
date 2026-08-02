# Visa Provider Agent Contract

- Follow the provider-family contract: `../AGENTS.md`.
- Follow the payment-family contract: `../../AGENTS.md`.
- Follow the commerce group contract: `../../../AGENTS.md`.
- Own only Visa product/network adapter translation and safe adapter
  registration.
- Do not present Visa as a generic PSP for every project; Visa integrations are
  product-specific and must be activated through explicit customer policy.
- Do not store Visa credentials, shared secrets, raw payloads, PAN, or CVV in
  configuration, schemas, logs, or returned evidence.
