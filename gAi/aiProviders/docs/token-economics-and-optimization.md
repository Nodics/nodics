# AI Token Economics and Optimization Contract

## Purpose

Every AI request consumes a limited context window and may create provider
cost. Nodics therefore treats token planning, reservation, reconciliation and
optimization as mandatory execution controls rather than reporting features.
No provider adapter may invoke its provider outside the `aiProviders` gateway.

## Implemented request gate

The current gateway:

1. resolves the configured usage profile;
2. resolves an enabled, registered adapter with the required capability;
3. rejects any matching global or scoped emergency stop;
4. atomically consumes an nCache request-rate permit;
5. requires provider/model-specific token estimation;
6. loads exact model pricing from effective configuration;
7. builds an immutable token plan;
8. rejects input, output or estimated-cost overflow;
9. persists idempotency evidence and claims the effective budget through
   revision-guarded compare-and-swap;
10. invokes the provider adapter;
11. requires normalized actual usage;
12. calculates exact actual cost and reconciles the reservation;
13. releases reservations only before provider invocation;
14. marks post-invocation failures uncertain for later repair because provider
    cost may already exist.

## Operational controls

`controls.killSwitches` provides layered emergency stops for global, tenant,
enterprise, application, principal, profile, provider, model, and capability
scope. These values are ordinary Nodics layered configuration and may be
promoted through the existing nDynamo governed runtime-configuration lifecycle;
aiProviders does not create another configuration authority.

`controls.rateLimit` defines the window, maximum requests, cache channel, and
key dimensions. The limiter uses nCache `incrementBounded`, which is implemented
by local, Redis, and Hazelcast adapters. Local cache is suitable only for
monoServer and single-process testing. A distributed deployment must map the
`aiProviders.rateLimit` channel to Redis or Hazelcast with no local fallback.
Cache outage fails provider invocation closed. Ledger repair and evidence
reconciliation do not pass through this invocation limiter.

Example tenant stop:

```js
controls: {
    killSwitches: {
        tenants: { customerA: true }
    }
}
```

Example distributed rate-limit channel override:

```js
cache: {
    aiProviders: {
        channels: {
            rateLimit: { enabled: true, fallback: false, engine: 'redis', ttl: 60 }
        }
    }
}
```

The default persistent implementation stores `aiTokenBudget`,
`aiTokenReservation`, and immutable `aiTokenUsageRecord` models. A repository
extension point isolates persistence mechanics while the ledger service remains
the lifecycle authority.

## Business and operations guide

A budget is the maximum AI usage allowed for one configured scope during a UTC
day or month. The default scope combines tenant, enterprise, application,
principal, usage profile, provider, and model. Missing optional dimensions use
`*`; tenant is always mandatory.

For each request:

1. Nodics creates or reuses the current budget window.
2. A unique idempotency key creates one reservation.
3. Estimated tokens and cost move into reserved capacity.
4. Successful provider usage moves reserved capacity into consumed capacity.
5. A pre-invocation cancellation releases capacity.
6. A timeout after invocation becomes `UNCERTAIN` and remains charged until
   provider evidence or governed reconciliation is available.

Operators with `ai.ledger.read` can inspect budgets, reservations, and usage.
Operators with `ai.ledger.manage` can change a budget ceiling, but cannot lower
it below already reserved and consumed values. Expiry is an internal
service-token operation and processes a bounded batch.

| Operation | Method and path | Authority |
| --- | --- | --- |
| List budgets | `GET /operations/ai-ledger/budgets` | `ai.ledger.read` |
| List reservations | `GET /operations/ai-ledger/reservations` | `ai.ledger.read` |
| List usage | `GET /operations/ai-ledger/usage` | `ai.ledger.read` |
| Update ceiling | `POST /operations/ai-ledger/budgets/update` | `ai.ledger.manage` |
| Expire stale reservations | `POST /internal/ai-ledger/reservations/expire` | internal service token |

All list operations are tenant-bound and limited to 1–500 records.

## Lifecycle and recovery

`PENDING → RESERVED → RECONCILING → RECONCILED` is the successful path.
Pre-invocation cancellation uses `RESERVED → RELEASING → RELEASED`. Capacity
failure ends in `REJECTED`; stale pre-invocation records end in `EXPIRED`.
Post-invocation ambiguity uses `RESERVED → UNCERTAIN`.

Budget changes use optimistic revision compare-and-swap with bounded retries.
This prevents concurrent requests from both claiming the same remaining
capacity. Persistence adapters may strengthen the transition with native
transactions. They must retain the same states, idempotency, exact arithmetic,
and evidence. A generated Nodics update service returns affected-count metadata
inside its standard `result` envelope; repository adapters must unwrap that
envelope before deciding whether a compare-and-swap succeeded.

If a process fails in `RECONCILING` or `RELEASING`, do not edit database values
manually. The implemented bounded repair scan records persistent findings,
recovers deterministic transitions, and reconstructs exact budget counters
from reservation and immutable usage evidence. `UNCERTAIN` usage is reconciled
only from positive provider evidence using the original pricing revision.

## Exact-value rule

- Token counts are non-negative JavaScript safe integers.
- Money and rates are canonical non-negative decimal strings.
- Cost arithmetic uses `BigInt`, never binary floating point.
- Per-million-token rates round up conservatively at the configured scale.
- Every plan records the effective pricing/configuration revision.

## Ownership

`aiProviders` owns provider estimation enforcement, exact pricing, immutable
plans, atomic reservation integration, actual usage, exact reconciliation,
release and cost-bearing retry/fallback policy.

`aiAssistant` owns semantic history and tool-result optimization. It may reduce
context but cannot calculate or charge provider cost.

`aiKnowledge` owns evidence deduplication/reranking, citation-preserving evidence
limits, content-hash embedding deduplication, skip-unchanged behavior and
batching. It cannot calculate or charge provider cost.

Each vendor provider owns provider/model-specific estimation and actual-usage
translation. It cannot reserve budget, select itself or maintain another
ledger.

## Customization rules

Projects may narrow limits or replace the economics/ledger service through
standard Nodics layering. They must not:

- disable fail-closed estimation or reservation;
- use floating-point cost arithmetic;
- invoke a provider before reservation;
- omit actual-usage reconciliation or uncertain-result repair;
- hide retry or fallback attempts;
- store credentials in pricing or optimization configuration;
- create a provider-local ledger or cache engine.

Optimization must preserve security instructions, authorization context,
mutation confirmation, required tool schemas, citations, source identity,
tenant/classification controls, idempotency and audit correlation.

Prompt, response and embedding reuse must use existing nCache contracts.
AI-specific configuration may define cache keys, TTLs and eligibility, but it
must not introduce another cache engine.

The database ledger remains authoritative even when `ledger.cache.enabled` is
true. Cache may accelerate read-only operational projections after a later
nCache integration; reservation approval always reloads and CAS-updates the
persistent budget.

## Configuration

`ledger.budget.period` supports `DAY` or `MONTH`. `scopeDimensions` determines
the composite budget identity. Default token and exact-cost ceilings initialize
new windows. Reservation TTL, uncertain retention, expiry batch size, and CAS
retry count are configurable through layered `properties.js`.

Changing scope dimensions creates different future budget identities. Plan and
test that migration; never merge old counters by floating-point arithmetic.

### Hierarchical budgets

The implemented hierarchy contract can enforce tenant, enterprise,
application, principal, profile, provider, and model accounts for the same
request. Levels and dimensions are layered configuration. Account codes are
sorted deterministically, and reservations plus usage evidence retain the
complete `budgetCodes` set.

Hierarchy remains disabled by default until the active database deployment is
qualified. The repository uses the provider-neutral nDatabase transaction
contract and reports `atomicBudgetHierarchy` only when the active adapter
advertises multi-record atomic capability. MongoDB requires a replica set or
sharded cluster; standalone local MongoDB fails during transaction execution.
Sequential writes plus compensation are never described as atomic.

A qualified repository must perform one transaction that creates or loads all
accounts, locks or revision-checks them in sorted order, validates every
ceiling, commits all mutations together, and aborts the whole operation when
any account fails.

## Verification

```text
node gAi/aiProviders/test/aiTokenEconomicsContract.test.js
node gAi/aiProviders/test/aiPersistentTokenLedgerContract.test.js
node gAi/aiProviders/test/aiProviderGatewayContract.test.js
node gAi/aiAssistant/test/aiAssistantContractAndConfiguration.test.js
node gAi/aiKnowledge/test/aiKnowledgeContractAndConfiguration.test.js
```
