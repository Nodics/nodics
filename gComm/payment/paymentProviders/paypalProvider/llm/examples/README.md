# PayPal Provider Example

Use PayPal as a provider module, not as Payment core logic. A customer module
may replace the mock adapter with a live PayPal REST transport while keeping
Payment-owned provider policy, transactions, refund, and reconciliation
evidence unchanged.
