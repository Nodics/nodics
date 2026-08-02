# Stripe Provider Example

Use Stripe as a provider module, not as Payment core logic. A customer module
may replace the mock adapter with a live PaymentIntents transport while keeping
Payment-owned provider policy, idempotency, transactions, refund, and
reconciliation evidence unchanged.
