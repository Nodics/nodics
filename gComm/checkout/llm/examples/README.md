# Checkout Examples

## Add a customer tax calculation adapter

1. Add a customer-owned Tax service, for example
   `CustomerTaxCalculationService.calculateEntryTax`.
2. Layer configuration:

```js
module.exports = {
  cart: {
    calculation: {
      delegates: {
        entryTax: {
          ownerModule: "tax",
          serviceNames: ["CustomerTaxCalculationService"],
          operations: ["calculateEntryTax"],
        },
      },
    },
  },
};
```

3. Keep Cart as the orchestrator only. The Tax service produces tax evidence;
   Cart persists accepted checkout evidence.

## Add a customer promotion adapter

Layer `cart.calculation.delegates.entryPromotions` or
`order.calculation.delegates.promotionEvidence` to point at a Promotion-owned
service. Do not calculate discounts inside Cart, Order, Axis, or Checkout.
