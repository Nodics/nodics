# Stock transfer foundation contract

- Transfer orchestration delegates quantity changes to idempotent `TRANSFER_OUT` and `TRANSFER_IN` Stock Movements.
- Transfer records coordinate exact dispatch, receipt, discrepancy, reconciliation, and reverse-return evidence; they never directly edit balances.
- Receipt cannot exceed dispatch and dispatch cannot exceed request.
- Damage, loss, and rejection are evidence, not fabricated Stock movements.
- Returns create a new reverse transfer and preserve original history.
- Commands are module-internal and service-token-only; generated persistence is private.
