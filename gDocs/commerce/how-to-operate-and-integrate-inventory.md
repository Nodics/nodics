# How To Operate And Integrate Inventory

Operations teams and BackOffice users can inspect Stock Balances, Movements, Reservations, Allocations, Transfers, and reconciliation findings through dedicated read-only Inventory endpoints. A user needs the `inventory.operations.read` permission. The endpoints are paged and return only safe operational fields.

Developers must use the relevant command API to change Stock. The operational pages are not editable database screens.

## Check and reconstruct on-hand Stock

A scheduled service can create an immutable Movement checkpoint when a Balance has no pending Movement. Later, Inventory can replay the contiguous applied Movement revisions after that checkpoint and compare the expected on-hand quantity and revision with the current Balance.

This process does not reconstruct Reservation state. Use reconciliation findings and Reservation evidence for held quantities. If a revision is missing or out of order, investigate the history instead of forcing a correction.

## Connect a WMS or POS

Inventory providers are disabled by default. An administrator configures a named WMS or POS provider that points to a Nodics connector module and lists its allowed operations. The connector module owns remote URLs and credentials.

Internal callers send an idempotency key, configured provider code, allowed operation, and bounded payload. Inventory records the attempt and outcome. A provider response never changes Stock directly; receipts, issues, transfers, and corrections still pass through Stock Movement.

## Multi-hop Units

Units can optionally convert through multiple exact conversion rules when no direct rule exists. Keep this disabled unless the business maintains a governed conversion graph. Nodics selects one shortest path; competing shortest paths fail instead of choosing silently.

## Continue

- [How Stock Availability Works](how-stock-availability-works.md)
- [How Inventory Reconciliation Works](how-inventory-reconciliation-works.md)
- [How Stock Movements Work](how-stock-movements-work.md)
