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
- Promise capacity modes are configuration-backed:
  - `FINITE` means the promise owns finite counters such as preorder or
    backorder capacity.
  - `UNBOUNDED` means the item is always sellable and does not decrement a
    finite counter.
  - `ON_DEMAND` means the business can sell first, then provision or source the
    unit through a provider, supplier, or fulfillment workflow.
- `counterManaged: false` promises still create reservation evidence for demand
  audit, but reserve/release orchestration does not increment or decrement
  finite Promise counters.
- `STOCK` promises require `stockCode` evidence so physical sellable capacity
  remains traceable to Stock.
- `DIGITAL`, `DROP_SHIP`, and `MADE_TO_ORDER` promises can carry
  `providerCode` and `provisioningPolicyCode` so later Workflow/Fulfillment
  steps know which provider or policy must create the real unit.
- Quantities are exact decimal strings normalized through Units exact arithmetic.
- For finite counter-managed promises, `reservedQuantity` cannot exceed
  `promisedQuantity`.
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

## Beginner model

Think of Inventory in three layers:

1. **Physical stock** answers: "How many pieces do we actually have in a
   warehouse?"
2. **Serialized stock units** answer: "Which exact device, SIM, eSIM profile,
   asset, or serial-numbered unit is this?"
3. **Inventory promise** answers: "Can the business accept this demand now, even
   if the exact physical unit is not assigned yet?"

These layers are deliberately separate. A phone sitting in warehouse A should be
counted by `stockBalance`. A specific IMEI device should be tracked by
`serializedStockUnit`. A preorder, backorder, digital product, drop-ship item,
or always-sellable subscription should be governed by `inventoryPromise`.

## Examples

### Physical product with stock

A warehouse has 10 chargers. This is normal physical stock:

```json
{
  "stockCode": "warehouse-a::charger-001",
  "itemCode": "charger-001",
  "availableQuantity": "10"
}
```

If checkout wants to reserve one charger, Stock Reservation and Stock Allocation
own that physical hold. Inventory Promise is optional here unless the business
wants to expose stock-backed sellable promise records.

### Stock-backed promise

If a business wants a promise record for physical stock, the Promise must point
to Stock evidence:

```json
{
  "promiseCode": "charger-stock",
  "promiseType": "STOCK",
  "capacityMode": "FINITE",
  "counterManaged": true,
  "stockCode": "warehouse-a::charger-001",
  "itemCode": "charger-001",
  "promisedQuantity": "10",
  "reservedQuantity": "0"
}
```

This keeps the promise traceable. Axis can show the promise, but Stock remains
the authority for warehouse quantity.

### Preorder with allowed overbooking

The business expects 100 phones from a supplier, but allows 20 extra orders as
overbooking with advance payment:

```json
{
  "promiseCode": "phone-preorder",
  "promiseType": "PRE_ORDER",
  "capacityMode": "FINITE",
  "counterManaged": true,
  "promisedQuantity": "100",
  "reservedQuantity": "100",
  "overbookingAllowed": true,
  "overbookingQuantity": "20",
  "overbookedQuantity": "19",
  "commercialPolicyCode": "preorderAdvancePolicy"
}
```

One more unit can still be accepted. Nodics creates an
`inventoryPromiseReservation` in the `OVERBOOKED` bucket and marks the payment
requirement as `ADVANCE`. Inventory does not charge the customer; Payment reads
that requirement and decides how much to capture.

### Infinite digital product or subscription

A software subscription or digital download may be sellable without a finite
warehouse counter:

```json
{
  "promiseCode": "starter-subscription-access",
  "promiseType": "PERPETUAL",
  "capacityMode": "UNBOUNDED",
  "counterManaged": false,
  "itemType": "LICENSE",
  "itemCode": "starter-subscription",
  "promisedQuantity": "0",
  "reservedQuantity": "0"
}
```

Checkout can reserve any positive quantity for demand evidence. The Promise
counter does not change because there is no finite stock pool to consume.

### eSIM with pregenerated serial inventory

Some eSIM businesses pregenerate ICCID/profile inventory. In that case the eSIM
is not infinite. The enterprise should model the aggregate available quantity in
Stock and track each profile through `serializedStockUnit`.

```json
{
  "serializedUnitCode": "esim-profile-iccid-001",
  "itemCode": "global-esim-5gb",
  "serialNumber": "8991101200000000001",
  "state": "AVAILABLE",
  "stockCode": "warehouse-digital::global-esim-5gb"
}
```

Checkout first works with quantity-level demand. Fulfillment/provisioning later
binds the exact serialized profile to the customer.

### eSIM provisioned on demand by an external provider

Some eSIM businesses call a partner provider only after purchase. There may be
no pregenerated ICCID pool. This is an on-demand promise:

```json
{
  "promiseCode": "global-esim-provider",
  "promiseType": "DIGITAL",
  "capacityMode": "ON_DEMAND",
  "counterManaged": false,
  "itemType": "DIGITAL_SKU",
  "itemCode": "global-esim-5gb",
  "providerCode": "defaultEsimProvider",
  "provisioningRequired": true,
  "provisioningPolicyCode": "instantEsimProvisioning",
  "promisedQuantity": "0",
  "reservedQuantity": "0"
}
```

Nodics still creates a reservation row when the cart/order asks for the eSIM, so
operators can audit demand. A later Workflow should call the provisioning
provider, receive the provider reference/ICCID/activation data, and attach that
evidence to the fulfillment or serialized-unit layer.

## Extension rules

- Do not use Stock Balance quantities to represent future supply.
- Do not bypass exact decimal strings or use JavaScript floating-point arithmetic
  for sellable capacity.
- Do not implement payment capture inside Inventory. Payment and checkout modules
  consume `paymentRequirement` and `commercialPolicyCode`.
- Customer modules may layer additional promise types, states, payment
  requirements, and commercial policy codes through configuration.
- Customer modules may layer `promiseTypePolicies` to add capacity behavior for
  new promise types. For example, a project can add `SUBSCRIPTION_ACCESS` as
  `UNBOUNDED` and counterless, or `CUSTOM_BUILD` as `ON_DEMAND` and
  provisioning-required.
- Promise-counter mutation must remain inside orchestration services with
  idempotency and revision guards, not direct generated CRUD writes.
- The current reserve/release orchestration is the first counter-governance
  slice. Production-grade concurrent checkout must add a transaction/outbox
  hardening slice so reservation row creation and Promise counter updates become
  atomically recoverable across infrastructure failures.

## Verification

```bash
node gComm/baseCommerce/inventory/test/inventoryPromiseFoundation.test.js
```
