# Bank Transfer Payment Agent Contract

Follow the method-family contract: `../AGENTS.md`.
Follow the payment-family contract: `../../AGENTS.md`.
Follow the commerce group contract: `../../../AGENTS.md`.

- Own only Bank Transfer method configuration, documentation, and extension
  boundaries.
- Bank transfer is deferred/manual evidence unless a customer module registers
  a governed provider adapter.
- Do not store bank credentials, secrets, or raw provider payloads.
