# Stock ON_HAND Availability Contract

- Compose existing Sourcing, Pool membership, Stock Balance, Units conversion, and exact arithmetic authorities.
- Return exact ON_HAND, reserved, and AVAILABLE_TO_SELL quantities with ordered Pool/Warehouse and Balance evidence; never claim allocation, delivery ATP, or fulfilment promise.
- Keep evaluation enterprise-scoped, service-token-only, bounded, read-only, and non-persistent.
- A dependency or conversion failure fails the request; never return a partial total.
- Public Storefront delivery introspects an opaque handle for the `inventory` audience, derives tenant, enterprise, Store, country, and channel, and replaces caller context before invoking the existing cached Availability chain.
- Public responses expose exact customer-safe totals only. Pool, Warehouse, Balance, revision, enterprise, and evidence details remain restricted to the service-token intent.
- Missing, expired, wrong-audience, incomplete, or unavailable Storefront context fails closed with no browser-scope fallback.
- Do not cache Availability until Stock mutation and reconciliation invalidation are governed.
