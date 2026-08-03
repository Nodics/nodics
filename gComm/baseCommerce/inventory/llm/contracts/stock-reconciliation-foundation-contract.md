# Stock reconciliation foundation contract

- Inventory owns immutable reconciliation runs and findings; they do not replace Balance, Movement, Reservation, Allocation, or Transfer authority.
- Service identities execute bounded resumable scans. Existing Nodics Workflow actions govern manual or automatic approval per finding policy. Service identities execute approved repairs.
- Manual actions retain human identity; automatic actions retain service/workflow identity. Never impersonate one identity type as the other.
- Inventory contributes workflow definitions and handlers but does not create a parallel workflow engine or duplicate carrier state.
- Scans validate reservation totals, negative balances, allocation and transfer arithmetic, pending movements, and stale reservation transitions.
- Only an approved negative-balance finding may auto-repair, exclusively through an idempotent Stock `CORRECTION` movement.
- Do not reconstruct Stock from movement history until a governed opening-balance checkpoint and retention contract exists.

- Scan is bounded, resumable by idempotent run key, and dry-run by default.
- Findings and runs are evidence and are never hard-deleted.
- Module/CronJob identities scan and repair; only human identities approve.
- Repairs require APPROVED repairable findings and use Stock Movement.
- No repair directly edits balance, reservation, allocation, or transfer history.
