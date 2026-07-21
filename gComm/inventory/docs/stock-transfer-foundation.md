# Stock transfer foundation

Inventory coordinates transfers through existing Stock Movements. Dispatch creates an idempotent `TRANSFER_OUT`; receipt creates an idempotent `TRANSFER_IN`. The transfer record stores source/destination references, exact requested/dispatched/received quantities, operation keys, movement evidence, and lifecycle state.

Transfers support partial dispatch and receipt. Receipt cannot exceed dispatched quantity and dispatch cannot exceed requested quantity. Only an undispatched `DRAFT` transfer may be cancelled. Interrupted movement calls are safe to replay because every leg has a stable idempotency key; transfer revision conflicts fail for reconciliation.

States are `DRAFT`, `IN_TRANSIT`, `PARTIALLY_RECEIVED`, `RECEIVED`, `CANCELLED`, and `RECONCILIATION_REQUIRED`. Damage and loss quantities are reserved in the model for the next governed discrepancy/reconciliation slice; callers must not edit them directly.
