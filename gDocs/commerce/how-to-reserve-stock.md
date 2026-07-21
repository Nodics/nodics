# How to reserve stock

A Stock Reservation protects units for a short-lived business process such as checkout, pickup preparation, or order allocation.

## Business sequence

1. Sourcing identifies eligible Stock Pools and Warehouses.
2. Availability reports `ON_HAND`, `reservedQuantity`, and `AVAILABLE_TO_SELL`.
3. The checkout or order module requests a reservation with a unique idempotency key and expiry time.
4. Inventory atomically increases the balance's reserved quantity if enough stock remains.
5. Cancellation, release, or expiry returns the quantity to sale.
6. Fulfillment consumes the reservation and applies a matching Stock `ISSUE`; Inventory decreases on-hand and held quantity together.

Reservations operate on Online operational Stock. Staged publishing remains appropriate for stable Warehouse, Pool, and Sourcing configuration, not live holds or movements.

Only authenticated modules and CronJob processes use these commands. Human BackOffice users act through an approved business API or workflow rather than calling internal reservation routes directly.

## Continue

- [How Stock Availability Works](how-stock-availability-works.md)
- [How Stock Movements Work](how-stock-movements-work.md)
- [How To Create Scheduled Jobs](../jobs/how-to-create-scheduled-jobs.md)
- [Nodics Documentation](../README.md)
