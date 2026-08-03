# Checkout Contracts

Checkout owns shared commerce checkout orchestration contracts. It may provide
helper utilities and guidance used by Cart and Order calculation pipelines, but
it must not own product identity, price resolution, promotion evaluation, tax
calculation, inventory counters, payment provider execution, or fulfillment
lifecycle.

## Delegate contract

Cart and Order calculation nodes call
`src/utils/commerceCalculationDelegateUtils.js` to resolve configured owner
services. The helper returns explicit evidence:

- `DELEGATED` when the configured owner service exists and completes.
- `DEFERRED` when the current runtime has no configured owner service.
- thrown error when an installed owner service rejects the request.

Customer modules customize checkout by layering `cart.calculation.delegates`,
`order.calculation.delegates`, or replacing one pipeline node. They must not
copy the whole checkout calculation flow or move owning-module rules into
Checkout.
