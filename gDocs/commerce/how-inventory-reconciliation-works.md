# How Inventory Reconciliation Works

Reconciliation checks operational Inventory for inconsistencies and produces findings before changing anything. Scheduled module processes can scan; a human operator must review and approve a repair; an internal process applies the approved correction through normal Stock Movement rules.

The checks compare held quantities with Reservation evidence, validate Allocation and Transfer arithmetic, identify pending Movement and stale Reservation transitions, and detect forbidden negative balances. Scans are bounded and can continue from a persisted cursor by replaying the same idempotency key. Dry-run is the default. Every run, finding, approval, and corrective movement remains auditable.

## Operator workflow

1. Schedule the internal scan through the existing CronJob capability, using a service identity and a stable idempotency key.
2. Repeat the same request while the run state is `PARTIAL`; stop when it is `COMPLETED`.
3. Repairable findings start a configured Nodics workflow. Every action in that workflow can independently be manual or automatic.
4. In the OOTB manual flow, a signed-in operator reviews the finding and the following automatic action performs the repair. In the OOTB automatic flow, policy permits both approval and repair to run automatically.
5. Investigate non-repairable Allocation, Transfer, pending Movement, stale Reservation, and reserved-quantity findings through their owning lifecycle.
6. The internal repair action creates an idempotent `CORRECTION` Stock Movement. It never edits a balance directly.

Configure `batchSize`, `maximumFindings`, `pendingAgeSeconds`, and `dryRunDefault` in the Inventory module's `properties.js`. Override these by environment layering; do not place operational configuration in `package.json`.

Under `stockReconciliation.workflow`, configure `defaultMode` and optional `findingModes` entries as `MANUAL` or `AUTOMATIC`. Automatic approval should be enabled only for deterministic, low-risk policies accepted by the business. Critical findings default to manual review. Workflow definitions, retries, rejection, errors, and terminal transitions remain owned by Nodics Workflow.

On-hand reconstruction from historical Movements is intentionally unavailable until an opening-balance checkpoint and retention contract exists. Operators must not infer a full balance from an incomplete history window.

## Continue

- [How Stock Movements Work](how-stock-movements-work.md)
- [How Stock Transfers Work](how-stock-transfers-work.md)
- [Nodics Documentation](../README.md)
