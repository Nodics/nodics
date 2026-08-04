# Payment Family Agent Contract

Follow the root Nodics contract: `../../AGENTS.md`.
Follow the commerce group contract: `../AGENTS.md`.
Follow global AI/development guidance: `../../gSetup/llm/ai-enablement-index.md`.

- `payment` is the Payment family group. It owns composition, documentation,
  and shared payment-family configuration only.
- Runtime payment authority belongs in `payment/paymentCore`.
- Payment methods belong in `payment/paymentMethods` and its child method
  modules.
- External or internal provider adapters belong in `payment/paymentProviders`
  and its child provider modules.
- Do not put transaction lifecycle, provider execution, method rules, gateway
  logic, secrets, schemas, routers, or services directly in this group module.
- Preserve the distinction between method and provider. A method describes how
  the customer pays; a provider executes or supports that method.
