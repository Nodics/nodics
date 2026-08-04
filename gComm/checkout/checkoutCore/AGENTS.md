# Checkout Core Agent Contract

This file gives AI coding agents mandatory guidance for this Nodics module or package boundary.

## Inheritance

- Follow the root Nodics AI contract: `../../../AGENTS.md`.
- Follow the Commerce group contract: `../../AGENTS.md`.
- Follow the Checkout family contract: `../AGENTS.md`.
- Follow global AI/development guidance: `../../../gSetup/llm/ai-enablement-index.md`.

## Module Work Rules

- Treat this directory as the shared Checkout Core capability boundary for commerce checkout orchestration contracts.
- Keep Checkout Core as an orchestration and integration seam. Product, Cart, Order, Pricing, Promotion, Tax, Inventory, Payment, and Fulfillment remain authoritative for their own business rules.
- Do not place cart-owned basket state, order-owned historical evidence, pricing algorithms, tax rules, payment-provider logic, inventory counters, or fulfillment lifecycle logic in this module.
- Put configurable behavior in layered configuration, utility contracts, tests, and documentation until a concrete checkout runtime service/schema/API is intentionally introduced.
- Customer modules may replace checkout delegate configuration or specific pipeline nodes, but must not fork the whole checkout journey or bypass owner modules.
- Update README, LLM guidance, generated context, and focused tests whenever shared checkout contracts change.
