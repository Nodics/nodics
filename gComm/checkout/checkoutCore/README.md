# Checkout Core

`checkoutCore` is the shared commerce checkout capability boundary. It owns reusable
checkout orchestration helpers and contracts that are broader than Cart or
Order, but it does not own the business rules of Product, Pricing, Promotion,
Tax, Inventory, Payment, or Fulfillment.

Use this module when a helper or contract is genuinely shared by Cart and Order
checkout calculation or placement. If a behavior belongs to only one capability,
keep it in that owning module instead.

## Calculation delegates

`checkoutCore/src/utils/commerceCalculationDelegateUtils.js` is a small adapter helper used
by Cart and Order entry calculation pipelines. It reads delegate configuration
from `cart.calculation.delegates` or `order.calculation.delegates`, calls the
configured owner service if it exists, and records safe evidence:

- `DELEGATED` means the configured owner service ran successfully.
- `DEFERRED` means the current runtime does not have the configured owner
  adapter yet.
- a thrown error means an installed owner adapter rejected the request, so the
  pipeline must fail instead of hiding an uncertain calculation result.

This utility deliberately does not calculate prices, discounts, taxes,
inventory availability, payments, or fulfillment decisions. It only preserves a
configuration-first, module-owned delegation pattern that customer modules can
extend without modifying framework source.
