# Fulfillment Agent Contract

Follow the root Nodics contract: `../../AGENTS.md`.
Follow the commerce group contract: `../AGENTS.md`.
Follow global AI/development guidance: `../../gSetup/llm/ai-enablement-index.md`.

## Ownership

- `fulfillment` is a Commerce family group. It owns composition and shared
  guidance for shipment, delivery, carrier, and future fulfillment operations.
- `fulfillmentCore` owns the currently implemented consignment, shipment,
  carrier, warehouse task, tracking, return-pickup, and delivery-release
  capability.
- Future `shipping`, `delivery`, and `carrier` child modules may be added only
  when their ownership is broader than the existing core fulfillment capability.

## Rules

- Do not put schemas, routers, controllers, facades, services, pipelines, or
  business logic directly in the `fulfillment` group.
- Keep fulfillment behavior configuration-first and replaceable through child
  modules.
- Customer modules should extend the smallest child boundary that owns the
  variation, not fork the whole fulfillment family.
