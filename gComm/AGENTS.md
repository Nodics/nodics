# gComm Agent Contract

This file gives AI coding agents mandatory guidance for this Nodics module or package boundary.

## Inheritance

- Follow the root Nodics AI contract: `../AGENTS.md`.
- Follow global AI/development guidance: `../gSetup/llm/README.md`.
- If a deeper child module has its own `AGENTS.md`, follow that file for changes inside the child module.

## Module Work Rules

- Treat this directory as a layered Nodics module boundary when it contains `package.json`.
- Keep capabilities stable and make implementations replaceable through the module hierarchy.
- Do not hardcode project, environment, server, node, tenant, or customer behavior into reusable framework code.
- Put configurable behavior in layered configuration, schemas, routers, services, pipelines, data, and runtime governance.
- Update the concise `README.md`, canonical documentation content, `llm/` guidance, generated context, and tests whenever behavior or extension contracts change.
- Generated files must be recreated from source definitions; do not hand-maintain generated artifacts as source of truth.

## Commerce Calculation Pipeline Contract

- Do not implement product, cart, order, tax, discount, delivery-charge, or payment-total calculation as one monolithic service.
- Model calculation as small, ordered nPipeline contracts. A parent aggregate pipeline must coordinate child pipelines instead of embedding every step in one method.
- Keep entry-level calculation separate from aggregate-level calculation. Cart calculation must call cart-entry calculation; order calculation must call order-entry calculation.
- Validation may itself be a pipeline. Put cart/order/header validation, entry validation, allocation validation, inventory readiness checks, and money-evidence checks in explicit nodes that customer modules can replace or reorder.
- Pipelines divide one technical task into deterministic steps. Workflow coordinates broader business processes such as checkout placement, approval, return/refund, or third-party handoff.
- Each pipeline node must delegate to the owning module for authority: Pricing resolves prices, Promotion evaluates discounts, Tax calculates tax evidence, Inventory resolves availability/reservation policy, Payment owns payment authorization/capture/refund, and Fulfillment owns delivery release.
- Customer modules should customize calculation by layering configuration or replacing individual node handlers. They must not fork the whole checkout calculation flow or duplicate owning-module business authority.
