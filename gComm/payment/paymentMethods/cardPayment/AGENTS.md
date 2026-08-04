# Card Payment Agent Contract

Follow the method-family contract: `../AGENTS.md`.
Follow the payment-family contract: `../../AGENTS.md`.
Follow the commerce group contract: `../../../AGENTS.md`.
Follow the root Nodics AI contract: `../../../../AGENTS.md`.
Follow global AI-tool guidance: `../../../../gSetup/llm/ai-enablement-index.md`.

- Own only card-payment method configuration, documentation, and extension
  boundaries.
- Do not execute payment gateways, store card secrets, store PAN/CVV, or mutate
  payment transaction lifecycle directly.
- Provider execution must stay in `paymentCore` through registered provider
  adapters such as Stripe, CyberSource, Visa, PayPal, or customer modules.
