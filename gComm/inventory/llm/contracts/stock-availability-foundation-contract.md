# Stock ON_HAND Availability Contract

- Compose existing Sourcing, Pool membership, Stock Balance, Units conversion, and exact arithmetic authorities.
- Return exact ON_HAND, reserved, and AVAILABLE_TO_SELL quantities with ordered Pool/Warehouse and Balance evidence; never claim allocation, delivery ATP, or fulfilment promise.
- Keep evaluation enterprise-scoped, service-token-only, bounded, read-only, and non-persistent.
- A dependency or conversion failure fails the request; never return a partial total.
- Do not cache Availability until Stock mutation and reconciliation invalidation are governed.
