# Stock reservation foundation

Inventory owns operational Stock truth. A reservation temporarily holds part of a `stockBalance`; cache providers accelerate reads but never own quantity.

## Lifecycle

`PENDING` is recovery evidence while the hold compare-and-set is attempted. A successful hold becomes `ACTIVE`. `RELEASE_PENDING` makes a partially persisted release safely replayable. Business cancellation and release produce `CANCELLED` or `RELEASED`; the CronJob-facing expiry command produces `EXPIRED`. Insufficient stock produces `REJECTED`.

`CONSUMED` means fulfillment accepted the reservation, but the quantity remains held until an `ISSUE` Stock Movement references the reservation. That movement decreases `quantity` and `reservedQuantity` together under the same balance revision. This prevents availability from reopening between checkout and fulfillment.

## Availability

For each eligible balance:

`AVAILABLE_TO_SELL = ON_HAND - reservedQuantity`

The Availability service converts both quantities through Units before aggregation. It returns exact canonical decimal strings and evidence for each contributing balance.

## Operations

The module-internal, service-token-only commands are:

- `POST /references/stock-reservations/reserve`
- `POST /references/stock-reservations/release`
- `POST /references/stock-reservations/cancel`
- `POST /references/stock-reservations/consume`
- `POST /internal/stock-reservations/expire`

Reserve requires an enterprise-scoped `stockCode`, positive exact quantity in the balance Unit, idempotency key, reason, and bounded TTL. Replaying the same intent returns the original reservation; reusing its key for another intent fails.

Configure TTL, retry, and expiry batch boundaries under `inventory.stockReservation` in `properties.js`. Projects can schedule the expiry endpoint using the existing CronJob module; Inventory does not create another scheduler.

## Current boundary

This foundation does not cache Availability. That is deliberate: cache invalidation should be added only with a governed mutation-event contract. Direct balance or reservation writes and hard deletion of evidence are rejected.
