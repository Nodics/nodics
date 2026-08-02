# cart Agent Contract

This file gives AI coding agents mandatory guidance for this Nodics module or package boundary.

## Inheritance

- Follow the root Nodics AI contract: `../../AGENTS.md`.
- Follow global AI/development guidance: `../../gSetup/llm/README.md`.
- If a deeper child module has its own `AGENTS.md`, follow that file for changes inside the child module.

## Module Work Rules

- Treat this directory as a layered Nodics module boundary when it contains `package.json`.
- Keep capabilities stable and make implementations replaceable through the module hierarchy.
- Do not hardcode project, environment, server, node, tenant, or customer behavior into reusable framework code.
- Put configurable behavior in layered configuration, schemas, routers, services, pipelines, data, and runtime governance.
- Update the concise `README.md`, canonical documentation content, `llm/` guidance, generated context, and tests whenever behavior or extension contracts change.
- Generated files must be recreated from source definitions; do not hand-maintain generated artifacts as source of truth.

## Cart Calculation Contract

- Cart calculation must be implemented through `cartValidationPipeline`, `cartEntryCalculationPipeline`, and `cartCalculationPipeline`.
- `cartCalculationPipeline` is the aggregate orchestrator. It validates the cart, calculates each entry through `cartEntryCalculationPipeline`, then rolls up shipping, discounts, tax, payment, and cart totals from accepted evidence.
- `cartEntryCalculationPipeline` owns one cart-entry calculation task only. It resolves product/unit context, delegates base price to Pricing, delegates entry promotions to Promotion, delegates tax evidence to Tax, verifies inventory promise readiness through Inventory, and prepares immutable line evidence for Cart.
- Do not calculate cart money, inventory, payment, or fulfillment authority directly in controllers, Axis renderers, or one large Cart service.
- Customer modules may replace or extend individual pipeline nodes for custom pricing, tax, promotion, inventory, rounding, or validation policy while preserving the parent/child pipeline shape.
