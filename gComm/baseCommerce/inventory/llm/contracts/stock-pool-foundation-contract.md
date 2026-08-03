# Stock Pool Foundation Contract

- Inventory owns `stockPool` and `stockPoolMember`.
- A Pool groups authoritative Warehouse references; it never owns, copies, reserves, aggregates, or promises Stock quantity.
- Product, channel, geography, zone, segment, delivery, and strategy conditions belong to the later Sourcing capability.
- Every Pool and membership is authenticated-enterprise scoped with a derived immutable identity.
- An active membership requires an active Pool and active Warehouse in the same enterprise.
- Lower integer membership priority is considered earlier by future sourcing, but has no effect before sourcing is implemented.
- Retire memberships before their Pool. Never hard-delete either record.
- Keep generated persistence private until secured human or module intent APIs are approved and tested.
- Customize types, transitions, and priority bounds through layered `properties.js` or replace the smallest service while preserving these invariants.
