# Inventory Promise Foundation Contract

Inventory Promise is the sellable-capacity layer for demand that may not be
immediately backed by physical on-hand Stock. Physical balance, movements,
reservations, allocations, issues, and fulfillment remain owned by the Stock
services.

Read the group-level
[Commerce Checkout Foundation](../../../llm/contracts/commerce-checkout-foundation-contract.md)
first for the beginner checkout model and cart/order relationship.

## Implemented guarantees

- `inventoryPromise` is enterprise-scoped, generated-service backed, and not
  exposed through generated public CRUD routes.
- Promise types are configuration-backed: `STOCK`, `PRE_ORDER`, `BACKORDER`,
  `PERPETUAL`, `DROP_SHIP`, `MADE_TO_ORDER`, and `DIGITAL`.
- Quantities are exact decimal strings normalized through Units exact arithmetic.
- `reservedQuantity` cannot exceed `promisedQuantity`.
- `overbookedQuantity` cannot exceed `overbookingQuantity`.
- Overbooked demand requires `overbookingAllowed: true`.
- `inventoryPromiseReservation` links checkout/order demand to one Promise using
  `promiseCode` and preserves the demand line and optional checkout allocation
  code.
- Promise Reservations are classified into a `STANDARD` or `OVERBOOKED` bucket.
- Overbooked reservations require a commercial payment requirement such as
  `ADVANCE` or `DEPOSIT`; Inventory stores the requirement and policy code but
  does not calculate money.
- Direct save of `inventoryPromiseReservation` is blocked. Reservation rows must
  be created through Promise Reservation orchestration so counters remain
  governed.
- `DefaultInventoryPromiseReservationOrchestrationService.reserve` creates
  idempotent promise reservations and increments either `reservedQuantity` or
  `overbookedQuantity` with a Promise revision guard.
- `DefaultInventoryPromiseReservationOrchestrationService.release` marks active
  reservations terminal and subtracts their standard or overbooked quantity with
  a Promise revision guard.
- Axis/BackOffice discovery uses backend-owned workbench metadata for Inventory
  Promises and Promise Reservations.

## Extension rules

- Do not use Stock Balance quantities to represent future supply.
- Do not bypass exact decimal strings or use JavaScript floating-point arithmetic
  for sellable capacity.
- Do not implement payment capture inside Inventory. Payment and checkout modules
  consume `paymentRequirement` and `commercialPolicyCode`.
- Customer modules may layer additional promise types, states, payment
  requirements, and commercial policy codes through configuration.
- Promise-counter mutation must remain inside orchestration services with
  idempotency and revision guards, not direct generated CRUD writes.
- The current reserve/release orchestration is the first counter-governance
  slice. Production-grade concurrent checkout must add a transaction/outbox
  hardening slice so reservation row creation and Promise counter updates become
  atomically recoverable across infrastructure failures.

## Verification

```bash
node gComm/inventory/test/inventoryPromiseFoundation.test.js
```
