# Inventory operations and integrations contract

- Cache computed Availability only through provider-neutral nCache; Stock Balance remains authoritative.
- Validate cached Balance revisions and invalidate on Stock, Pool, membership, and Sourcing mutations.
- Operational APIs are human-authenticated, permission-gated, bounded, read-only, and allow-listed.
- Checkpoints are immutable service-owned evidence and reconstruct only contiguous on-hand Movement history.
- WMS/POS providers are disabled by default, module-transport-only, operation-allow-listed, service-authenticated, idempotent, bounded, and auditable.
- Provider responses never bypass Stock Movement or another existing Inventory lifecycle authority.
