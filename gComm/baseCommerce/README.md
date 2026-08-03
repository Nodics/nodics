# Base Commerce

Base Commerce groups reusable commerce foundations that are used by checkout,
orders, fulfillment, payment, cancellation, return, refund, storefront, Axis,
and customer modules.

It is intentionally a group module. Runtime authority stays inside child
capabilities:

- `product`
- `store`
- `pricing`
- `promotion`
- `tax`
- `inventory`

## Boundary

Use this group for composition and shared guidance only. Do not place business
schemas, routers, provider execution, calculation logic, or lifecycle state
machines directly in `baseCommerce`.

Checkout and order-lifecycle modules must reuse these foundations through
their owning services and configured pipeline delegates.

## Customization

Customer projects customize a specific foundation by layering the relevant
child capability. For example:

- add product attributes in a project product module;
- override price selection through Pricing configuration/service replacement;
- add tax provider rules in Tax;
- add inventory sourcing policy in Inventory;
- add promotion rules in Promotion.

Do not copy a whole foundational module into a customer project just to change
one policy. Replace the smallest configuration block, service, pipeline node,
or provider adapter that owns the variation.

