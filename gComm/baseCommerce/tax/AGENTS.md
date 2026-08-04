# Tax Agent Contract

Follow the root Nodics contract: `../../../AGENTS.md`.
Follow the commerce group contract: `../AGENTS.md`.
Follow global AI/development guidance: `../../../gSetup/llm/README.md`.

- Tax owns jurisdiction, provider metadata, tax rates, exemptions, tax quote headers, and tax quote line evidence.
- Pricing may declare tax mode hints and amounts, but it must not calculate tax. Cart and Order may reference Tax quote evidence, but they must not own tax rules or provider execution.
- Tax provider integrations are replaceable services selected by layered configuration. Do not hardcode customer providers, credentials, tenant, enterprise, country, region, jurisdiction, or environment behavior.
- Never store credentials, private certificates, tax-provider secrets, raw provider payloads, or unsafe audit data in Tax schemas.
- Money and rate fields must remain exact decimal strings. Do not use JavaScript floating-point arithmetic for tax, price, order, payment, stock, or shipment decisions.
- Jurisdiction, rounding, exemption, tax-inclusive/tax-exclusive, provider retry, and reconciliation behavior must be explicit and configurable.
- Generated CRUD routers remain disabled. Public, checkout, BackOffice, or service-to-service mutation must use approved intent/workflow APIs, permissions, validation, audit, and lifecycle transitions.
- Every behavior change requires contract tests, README/LLM guidance, generated context, and business/developer customization documentation.
