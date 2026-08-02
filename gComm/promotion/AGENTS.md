# Promotion Agent Contract

## Inheritance

- Follow `../AGENTS.md` and the root Nodics AI contract.

## Module Boundary

`promotion` owns commerce promotion campaigns, promotion rules, condition/action
metadata, coupon campaigns, coupon codes, evaluation-run evidence, and applied
discount evidence.

Promotion does not own base price, tax, cart lifecycle, order lifecycle,
payment capture, inventory, fulfillment, or customer/profile identity.

## Implementation Rules

- Keep promotion behavior configuration-first and replaceable through later
  project/customer layers.
- Do not calculate money with JavaScript floating point. Store monetary values
  as exact decimal strings.
- Keep rule authoring metadata separate from immutable applied-discount evidence.
- Keep coupons and coupon redemption evidence governed; never store secrets or
  unbounded customer payloads in coupon records.
- Promotion may recommend or calculate discount evidence, but Cart and Order
  remain responsible for accepting/freeze-framing their own commercial snapshot.
- Axis exposure must come from backend-owned BackOffice metadata and schema
  contracts, not frontend-specific authority.
