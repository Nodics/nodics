# Base Commerce Agent Contract

Follow the root Nodics contract: `../../AGENTS.md`.
Follow the commerce group contract: `../AGENTS.md`.
Follow global AI/development guidance: `../../gSetup/llm/ai-enablement-index.md`.

## Ownership

- `baseCommerce` is a Commerce foundation group. It owns composition,
  documentation, and shared foundation guidance for reusable commerce
  capabilities.
- Foundational commerce capabilities under this group may be reused by
  checkout, cart, order, payment, fulfillment, shipping, cancellation, return,
  refund, storefront, Axis, and customer modules.
- Runtime business authority remains in the child capability that owns the
  specific domain:
  - Product owns product, category, classification, variant, and publication
    model authority.
  - Store owns store, point of service, and commerce-site/storefront operating
    context authority.
  - Pricing owns price lists, exact price evidence, delivery charge quotes, and
    price resolution.
  - Promotion owns promotion, coupon, discount-rule, budget, and applied
    promotion evidence.
  - Tax owns jurisdiction, rate, exemption, tax provider, tax quote, and tax
    quote-line evidence.
  - Inventory owns warehouses, stock, reservation, allocation, promise,
    sourcing, transfer, movement, reconciliation, serialized stock, and return
    disposition evidence.

## Rules

- Do not put runtime schemas, routers, controllers, facades, pipelines, provider
  adapters, or business services directly in `baseCommerce`.
- Do not let checkout/order/refund logic copy foundational rules. They must
  call or compose the owning child capability through configured services,
  pipelines, or provider contracts.
- Keep foundation behavior configuration-first and replaceable through the
  layered module hierarchy.
- Customer/project modules should extend individual foundational capabilities,
  not fork the whole `baseCommerce` group.
- When adding a new foundational capability, first prove it belongs here rather
  than in checkout, payment, fulfillment, order lifecycle, or a separate
  provider family.

