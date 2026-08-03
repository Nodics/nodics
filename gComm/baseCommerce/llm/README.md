# Base Commerce AI Guidance

Use this guidance when working in `gComm/baseCommerce` or one of its child
foundation modules.

- `baseCommerce` is a group/composition module only.
- Do not add runtime business logic directly to this group.
- Foundational behavior belongs in the owning child capability.
- Checkout, order lifecycle, cancellation, return, refund, payment, fulfillment,
  storefront, Axis, and customer modules must reuse these foundations instead
  of copying their rules.
- Customer modules customize through the smallest later-layer configuration,
  service, pipeline node, provider adapter, or schema extension that owns the
  variation.

