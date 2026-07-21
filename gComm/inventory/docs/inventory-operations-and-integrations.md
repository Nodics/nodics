# Inventory operations and integrations

Inventory exposes bounded read-only operational projections for Balances, Movements, Reservations, Allocations, Transfers, and Reconciliation findings. These routes require human authentication plus `inventory.operations.read`. They accept only documented scalar filters and never expose generated CRUD, arbitrary database operators, credentials, or internal enterprise fields.

BackOffice connects directly to Inventory and uses `/operations/*` routes. Configure `inventory.operations.maximumResultCount` to bound each page. Mutation continues through the existing intent APIs and orchestration services.

Movement checkpoints are immutable service-created snapshots. Create one only when the Balance has no pending Movement. Reconstruction starts from the newest checkpoint and accepts only a contiguous chain of applied Movement revisions. It reconstructs on-hand quantity; Reservation state cannot be reconstructed from Movement history and must be reconciled through Reservation evidence.

External WMS/POS dispatch is disabled by default. Configure named providers under `inventory.externalProviders.providers` with a type, Nodics module name, connection name, allowed operations, timeout, and retry limit. Callers supply a provider code and operation—not a URL or credential. The adapter uses a runtime-bound internal token and persists idempotent operation evidence. Provider responses do not directly edit Stock; accepted business changes must return through Stock Movement or the relevant Inventory intent.

## Operator checklist

1. Grant `inventory.operations.read` only to operational roles.
2. Schedule checkpoint creation through the existing CronJob module using service identity.
3. Investigate non-contiguous reconstruction before creating corrections.
4. Enable one provider at a time in a controlled environment and verify timeout, retry, duplicate, and failure behavior.
5. Never place provider secrets in Inventory configuration; the connector module owns its credentials.
