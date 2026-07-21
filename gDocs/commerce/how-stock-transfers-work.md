# How Stock Transfers Work

A Stock Transfer moves Inventory between Warehouses using two governed movements: `TRANSFER_OUT` removes dispatched quantity from the source and `TRANSFER_IN` records accepted quantity at the destination. The transfer record connects both sides and supports partial dispatch and receipt.

Warehouse operators can record damaged, lost, or rejected quantities. Reconciliation verifies that received plus damaged plus lost equals dispatched quantity. A return never rewrites history; it creates a new reverse transfer.

Only authenticated modules use the internal create, dispatch, receive, cancel, discrepancy, reconcile, and return commands. Exact quantities, operation idempotency, and revisions make retries safe. Cache is not transfer or Stock authority.

## Continue

- [How Stock Movements Work](how-stock-movements-work.md)
- [How Stock Allocation Works](how-stock-allocation-works.md)
- [Nodics Documentation](../README.md)
