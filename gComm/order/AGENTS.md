# order Agent Contract

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

## Order Calculation Contract

- Order calculation must be implemented through `orderValidationPipeline`, `orderEntryCalculationPipeline`, and `orderCalculationPipeline`.
- `orderCalculationPipeline` is the aggregate orchestrator. It validates the order, calculates/reconciles each order entry through `orderEntryCalculationPipeline`, then rolls up delivery, discount, tax, payment, refund, and order totals from accepted evidence.
- Order calculation must preserve historical checkout evidence. Recalculation is allowed only through explicit order-owned lifecycle operations such as amendment, return, refund, adjustment, or reconciliation.
- Checkout placement and reverse processing remain Workflow-owned business processes. Calculation pipelines divide the technical calculation task; they must not replace Workflow or hide Payment, Inventory, Fulfillment, or Promotion side effects inside Order.
- Customer modules may replace or extend individual pipeline nodes while preserving the parent/child pipeline shape and owning-module authority boundaries.
