# Stripe Provider Agent Contract

- Follow `../AGENTS.md`.
- Own only Stripe protocol translation and safe adapter registration.
- Do not store Stripe credentials, webhook secrets, raw PaymentIntent payloads,
  PAN, or CVV in configuration, schemas, logs, or returned evidence.
- Keep live calls disabled until a customer/environment module provides guarded
  transport, secret references, retry policy, and live sandbox evidence.
