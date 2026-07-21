# Stock reconciliation foundation

Reconciliation detects inconsistencies without silently rewriting Stock. Service identities run bounded, dry-first scans. Repairable findings enter the existing Nodics Workflow engine. Each workflow action independently declares whether it is manual or automatic; the workflow is not globally classified as manual or automatic. Service identities execute approved corrections through Stock Movement.

The scanner detects reserved-quantity mismatches, forbidden negative balances, Allocation quantity inconsistencies, Transfer quantity inconsistencies, pending Movements, and stale Reservation transitions. Findings and runs are immutable operational evidence. Only negative balances have an automatic repair in this slice: an idempotent `CORRECTION` movement after human approval. Every other finding requires investigation through its owning lifecycle.

Configure batch size, total finding limit, stale-transition age, and dry-run default under `inventory.stockReconciliation` in `properties.js`. A run uses one idempotency key and a persisted per-evidence cursor; invoke the same request until its state is `COMPLETED`. CronJob may invoke the internal scan endpoint. Human approval uses `inventory.reconciliation.approve`; scan and repair routes require service tokens.

`inventory.stockReconciliation.workflow` maps each finding type to `MANUAL` or `AUTOMATIC`. The OOTB manual graph contains an automatic head, a manual review action, and an automatic completion action. The OOTB automatic graph contains an automatic head and automatic completion action. Projects may layer different actions and channels through normal Workflow initializer data. Rejection and error use Workflow-owned terminal channels.

Manual completion records the authenticated human approver, then calls the internal repair endpoint with a runtime-bound module token. Automatic completion records the workflow carrier as approval evidence and requires service identity throughout. An automatic action never records itself as a human user.

The scanner does not reconstruct on-hand quantity from movement history because no opening-balance checkpoint contract exists yet. Treating an incomplete movement window as Stock truth would create false corrections. Add that capability only after a governed checkpoint and retention contract is implemented.
