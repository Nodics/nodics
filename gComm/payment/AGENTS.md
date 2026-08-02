# Payment Agent Contract

Follow the root Nodics contract: `../../AGENTS.md`.
Follow the commerce group contract: `../AGENTS.md`.
Follow global AI/development guidance: `../../gSetup/llm/README.md`.

- Payment owns provider contracts, payment transactions, authorization, capture, refund, void, and safe payment evidence.
- Cart and Order may reference payment evidence, but they must not execute gateway logic or mutate Payment transaction lifecycle directly.
- Gateway/provider integrations are replaceable services selected by layered configuration. Do not hardcode customer providers, credentials, tenant, enterprise, or environment behavior.
- Never store raw PAN, CVV, secrets, provider credential payloads, or unsafe gateway responses in Payment schemas.
- Money fields must remain exact decimal strings. Do not use JavaScript floating-point arithmetic for commercial decisions.
- Generated CRUD routers remain disabled. Public or BackOffice mutation must use approved intent/workflow APIs, permissions, validation, audit, and lifecycle transitions.
- Every behavior change requires contract tests and updated README/LLM guidance/generated context.
