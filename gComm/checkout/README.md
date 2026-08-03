# Checkout

Checkout groups the mutable cart journey, shared checkout orchestration
contracts, and durable order projection.

It is intentionally a group module. Runtime authority stays inside child
capabilities:

- `cart`
- `checkoutCore`
- `order`

## Boundary

Use this group for composition and shared guidance only. Do not place checkout
schemas, routers, provider execution, calculation logic, or lifecycle state
machines directly in `checkout`.

Cart owns mutable checkout intent. Checkout Core owns shared orchestration
helpers. Order owns durable order creation, placement workflow, reverse
checkout workflow entry points, and historical evidence.

## Customization

Customer projects customize checkout behavior by layering the relevant child
capability:

- extend cart validation or allocation policy in `cart`;
- replace shared delegate helpers or orchestration contracts in `checkoutCore`;
- extend order placement, projection, history, and reverse-flow policy in
  `order`.

Do not copy the full checkout journey into a project module just to adjust one
policy. Replace the smallest configuration block, service, pipeline node, or
workflow action that owns the variation.
