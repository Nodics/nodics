# Cash On Delivery Payment Agent Contract

Follow the method-family contract: `../AGENTS.md`.
Follow the payment-family contract: `../../AGENTS.md`.
Follow the commerce group contract: `../../../AGENTS.md`.

- Own only Cash on Delivery method configuration, documentation, and extension
  boundaries.
- COD is deferred evidence; fulfillment and reconciliation still need Payment
  Core governance.
- Do not mutate order, fulfillment, or payment transaction lifecycle directly.
