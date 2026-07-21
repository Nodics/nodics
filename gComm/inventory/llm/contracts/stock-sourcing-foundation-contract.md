# Stock Sourcing Foundation Contract

- Inventory owns declarative request-context matching into ordered Stock Pool references.
- Policies and Rules are enterprise-scoped, immutable in identity, lifecycle-governed, and never hard-deleted.
- Criteria use configured keys and scalar/list equality only. Never accept scripts, database operators, or executable expressions.
- Evaluation is deterministic and side-effect free. It must not read quantities, calculate availability, reserve Stock, or copy Pool membership.
- Active Rules require active Policy and Pools. Retire Rules before their Policy.
- Customize through layered properties or a service override preserving these invariants.
- The intent route requires the internal-token permission and service identity, validates enterprise scope independently of evaluator overrides, enforces configured bounds, and returns only Pool/Rule identifiers plus evaluation and correlation evidence.
- Cache only the safe evaluation result through `DefaultCacheService`. Provider choice belongs to `cache.inventory.channels.sourcing`; explicit-time requests bypass by default, TTL cannot cross effective boundaries, and Pool/membership/Policy/Rule mutations invalidate through nCache.
- Local, Redis, and Hazelcast use bundled adapters. Hazelcast stays disabled by default and requires guarded live-cluster qualification before production selection.
