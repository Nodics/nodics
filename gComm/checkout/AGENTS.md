# Checkout Agent Contract

Follow the root Nodics contract: `../../AGENTS.md`.
Follow the commerce group contract: `../AGENTS.md`.
Follow global AI/development guidance: `../../gSetup/llm/README.md`.

## Ownership

- `checkout` is a Commerce family group. It owns composition and shared guidance
  for the checkout journey.
- `cart` owns mutable checkout intent and cart-side allocation evidence.
- `checkoutCore` owns shared checkout orchestration helpers and reusable
  contracts.
- `order` owns durable order projection, checkout placement, historical order
  evidence, and reverse checkout workflow entry points.

## Rules

- Do not put schemas, routers, controllers, facades, services, pipelines, or
  business logic directly in the `checkout` group.
- Keep checkout orchestration configuration-first and replaceable through child
  modules.
- Cart-to-order placement must use Workflow for the business lifecycle and
  nPipeline for deterministic single-task steps.
- Customer modules should extend the smallest child boundary that owns the
  variation, not fork the whole checkout family.
