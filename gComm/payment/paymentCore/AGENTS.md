# Payment Core Agent Contract

Follow the root Nodics contract: `../../../AGENTS.md`.
Follow the commerce group contract: `../../AGENTS.md`.
Follow the payment family contract: `../AGENTS.md`.
Follow global AI/development guidance: `../../../gSetup/llm/ai-enablement-index.md`.

- Payment Core owns provider contracts, payment transactions, authorization, capture, refund, void, and safe payment evidence.
- Cart and Order may reference payment evidence, but they must not execute gateway logic or mutate Payment transaction lifecycle directly.
- Gateway/provider integrations are replaceable services selected by layered configuration. Do not hardcode customer providers, credentials, tenant, enterprise, or environment behavior.
- Never store raw PAN, CVV, secrets, provider credential payloads, or unsafe gateway responses in Payment schemas.
- Money fields must remain exact decimal strings. Do not use JavaScript floating-point arithmetic for commercial decisions.
- Partial cancellation/refund calculation must remain Payment-owned. Scope original Order payment allocations by exact selected quantity, preserve original payment-group/provider routing evidence, and distribute currency-minor-unit remainders deterministically under configured rounding policy.
- Approved cancellation execution must resolve the persisted original transaction and preserve its method, provider, currency, and transaction reference. Request hints must never reroute the original payment rail.
- Authorized funds use the provider VOID boundary; captured or settled funds use REFUND. Cumulative reversal evidence must not exceed the exact original amount, and conflicting replays require reconciliation.
- Generated CRUD routers remain disabled. Public or BackOffice mutation must use approved intent/workflow APIs, permissions, validation, audit, and lifecycle transitions.
- Approved Refund execution reuses Payment reversal authority, forces REFUND against captured or settled originals, and records the Order refund request identity without accepting alternate rails by default.
- Every behavior change requires contract tests and updated README/LLM guidance/generated context.
