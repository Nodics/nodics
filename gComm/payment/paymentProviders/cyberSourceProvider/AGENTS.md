# CyberSource Provider Agent Contract

- Follow the provider-family contract: `../AGENTS.md`.
- Follow the payment-family contract: `../../AGENTS.md`.
- Follow the commerce group contract: `../../../AGENTS.md`.
- Own only CyberSource protocol translation and safe adapter registration.
- Do not store CyberSource keys, merchant secrets, raw payment payloads, PAN,
  or CVV in configuration, schemas, logs, or returned evidence.
- Keep live calls disabled until a customer/environment module supplies guarded
  transport, authentication, and live sandbox evidence.
