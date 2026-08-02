# Inventory Contracts

Implemented contracts:

- [Warehouse Foundation](warehouse-foundation-contract.md)
- [Stock Pool Foundation](stock-pool-foundation-contract.md)
- [Stock Sourcing Foundation](stock-sourcing-foundation-contract.md)
- [Stock ON_HAND Availability](stock-availability-foundation-contract.md)
- [Stock Reservation Foundation](stock-reservation-foundation-contract.md)
- [Stock Allocation Foundation](stock-allocation-foundation-contract.md)
- [Inventory Promise Foundation](inventory-promise-foundation-contract.md)
- [Stock Transfer Foundation](stock-transfer-foundation-contract.md)
- [Stock Reconciliation Foundation](stock-reconciliation-foundation-contract.md)
- [Inventory Operations and Integrations](inventory-operations-and-integrations-contract.md)

Return disposition movement execution is part of the Stock Movement and Stock
Allocation contract surface: `DefaultReturnDispositionMovementService` consumes
Fulfillment return disposition intent and creates Inventory-owned Stock Movement
evidence. It must remain service-token protected, idempotent, exact-quantity,
and revision guarded.

Return disposition recovery review is the same owner boundary without mutation.
`DefaultReturnDispositionMovementService.reviewDispositionRecovery` checks
whether expected idempotent Stock Movement evidence already exists and returns
safe review/adjustment guidance for operators. Order may record this evidence
on `checkoutReverseRun`, but it must not mutate Inventory stock records during
compensation.

Future coordinated transfer and reconciliation contracts must not be documented here until implemented.
