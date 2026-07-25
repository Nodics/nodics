# Persistent AI Token Ledger Guide

## Who This Guide Is For

This guide serves five readers:

- a business owner deciding how Nodics controls AI cost;
- an administrator setting usage limits and investigating failures;
- a business user whose AI request is accepted or rejected;
- a partner developer customizing AI policy for an application;
- a framework maintainer or AI coding tool extending `aiProviders`.

The ledger backend, bounded transitional-state repair, persistent repair
evidence, and positive provider-usage reconciliation are implemented. OpenAI,
Anthropic, Gemini, Axis Assistant, automatic provider lookup, and dashboards
are not yet complete. This guide does not present those items as available.

## Business Overview

An AI provider normally charges for processed tokens. Without a reservation
boundary, many simultaneous users could exceed a planned budget before an
operator sees a usage report.

Nodics treats a budget as an execution control:

1. estimate tokens and exact cost;
2. reserve capacity before provider invocation;
3. reject the request when capacity is insufficient;
4. reconcile normalized provider usage afterward;
5. retain uncertain capacity when the provider may have processed a request;
6. preserve immutable usage evidence for reporting and audit.

This reduces accidental overspend. It does not guarantee that a provider bill
will always equal Nodics estimates; provider pricing, rounding, delayed usage,
and ambiguous network failures require reconciliation.

## Terminology

| Term | Plain-language meaning |
| --- | --- |
| Token plan | Immutable estimate made before a provider call. |
| Budget | Token and cost ceiling for one configured scope and time window. |
| Reservation | Capacity temporarily held for one idempotent request. |
| Reconciliation | Movement from reserved estimates to actual provider usage. |
| Exact cost | Decimal-string money calculated without JavaScript floating point. |
| Idempotency key | Request identity preventing accidental duplicate reservation. |
| CAS | Revision check preventing concurrent requests from spending the same capacity. |
| Uncertain | Provider invocation may have started, but actual usage is not known. |

## Ownership And Source Map

| Concern | Authoritative location |
| --- | --- |
| Layered defaults | `gAi/aiProviders/config/properties.js` |
| Configuration validation | `src/service/config/defaultAiProviderConfigurationService.js` |
| Persistent models | `src/schemas/schemas.js` |
| API contracts | `src/schemas/apiContracts.js` |
| Exact planning/cost | `src/service/token/defaultAiTokenEconomicsService.js` |
| Lifecycle authority | `src/service/token/defaultAiTokenLedgerService.js` |
| Persistence adapter | `src/service/token/defaultAiTokenLedgerRepositoryService.js` |
| Operational queries | `src/service/token/defaultAiTokenLedgerOperationsService.js` |
| Secured routes | `src/router/routers.js` |
| Request mapping | `src/controller/defaultAiTokenLedgerController.js` |
| Developer/AI rules | `AGENTS.md` and `llm/contracts/README.md` |
| Focused proof | `test/aiPersistentTokenLedgerContract.test.js` and `test/aiTokenLedgerApiContract.test.js` |

Generated CRUD routers are disabled for all ledger schemas. Callers must use
the lifecycle and operations services.

## Data Model

### AI Token Budget

One record represents a configured scope during one UTC day or month. It holds:

- maximum and reserved token counts;
- maximum, reserved, and consumed exact cost;
- consumed tokens;
- effective scope dimensions;
- start/end time;
- revision used for concurrency control.

When hierarchical budgets are enabled, one request references several budget
records and persists their complete sorted identities in `budgetCodes`. The
repository must update all participating accounts within one qualified
transaction. The built-in repository now uses the provider-neutral nDatabase
transaction contract and MongoDB adapter. Hierarchy remains disabled until the
active deployment is live-qualified as a replica set or sharded cluster;
standalone MongoDB fails closed.

### AI Token Reservation

One tenant-scoped idempotency identity represents one intended provider
attempt. It stores the immutable plan, request hash, held values, lifecycle
state, timestamps, and optional actual usage.

### AI Token Usage Record

One immutable record stores normalized actual usage, exact cost, provider/model,
pricing revision, configuration revision, outcome, principal context, and
correlation identity.

## Lifecycle

```text
PENDING -> RESERVED -> RECONCILING -> RECONCILED
                 |
                 +-> RELEASING -> RELEASED
                 |
                 +-> UNCERTAIN

PENDING/RESERVED -> EXPIRED
PENDING -> REJECTED
```

- `PENDING` prevents duplicate request creation while capacity is claimed.
- `RESERVED` allows provider execution.
- `RECONCILING` and `RELEASING` protect a transition from concurrent repeats.
- `UNCERTAIN` retains capacity because treating possible usage as free is unsafe.
- `RECONCILED`, `RELEASED`, `EXPIRED`, and `REJECTED` are terminal evidence.

## Administrator Configuration

Customize through a later-loaded project module:

```js
module.exports = {
    aiProviders: {
        ledger: {
            reservationTtlSeconds: 300,
            uncertainRetentionSeconds: 86400,
            expiryBatchSize: 100,
            maximumCompareAndSwapAttempts: 5,
            budget: {
                period: 'MONTH',
                scopeDimensions: [
                    'tenantCode',
                    'enterpriseCode',
                    'applicationCode',
                    'principalCode',
                    'profileCode',
                    'providerCode',
                    'modelCode'
                ],
                defaultMaximumTokens: 1000000,
                defaultMaximumCost: '100.00000000',
                currencyCode: 'USD'
            }
        }
    }
};
```

Do not copy `DefaultAiTokenLedgerService`. Do not place these properties in
`package.json`. Do not store provider credentials here.

### Scope Decision Examples

- Include `principalCode` to give each authenticated employee a separate
  budget.
- Exclude `principalCode` to let authenticated employees share an application
  budget.
- Include `providerCode` and `modelCode` to separate model spending.
- Exclude them to share one ceiling across models.

Changing dimensions changes future budget identity. Test and migrate reporting
deliberately rather than rewriting existing records.

## Roles And Permissions

| Permission | Allowed work |
| --- | --- |
| `ai.ledger.read` | Read tenant-bound budgets, reservations, and usage. |
| `ai.ledger.manage` | Change an existing budget ceiling within safe commitments. |
| `ai.ledger.repair.approve` | Human approval of deterministic repair when policy uses `MANUAL`. |
| Internal service-token permission | Run bounded expiry recovery. |
| Internal service-token permission | Run repair scans and reconcile positive provider evidence. |

No public or customer-anonymous ledger route exists. A caller cannot choose
another tenant, provider, model, principal, or price through these APIs.

## API Examples

### Read Budgets

```text
GET /nodics/aiProviders/v0/operations/ai-ledger/budgets?limit=50
Authorization: Bearer <employee-token>
x-enterprise-code: default
```

Expected result: at most 50 budgets belonging to the authenticated tenant.

### Update A Ceiling

```text
POST /nodics/aiProviders/v0/operations/ai-ledger/budgets/update
Authorization: Bearer <authorized-employee-token>
Content-Type: application/json

{
  "budgetCode": "<existing-budget-code>",
  "maximumTokens": 2000000,
  "maximumCost": "175.00000000"
}
```

Expected result: the revision increases by one. A ceiling below current
reserved plus consumed commitments is rejected.

### Expire Stale Reservations

```text
POST /nodics/aiProviders/v0/internal/ai-ledger/reservations/expire
Authorization: Bearer <module-service-token>
Content-Type: application/json

{}
```

Expected result: a bounded response with scanned and expired counts.

### Preview Or Apply Repair

```text
POST /nodics/aiProviders/v0/internal/ai-ledger/repair/scan
Authorization: Bearer <module-service-token>
Content-Type: application/json

{
  "idempotencyKey": "ai-ledger-repair-2026-07-24-01",
  "dryRun": true
}
```

Dry run records findings without state repair. Set `dryRun` to `false` with a
new idempotency key to apply deterministic recovery.

### Reconcile Positive Provider Evidence

```text
POST /nodics/aiProviders/v0/internal/ai-ledger/repair/uncertain/reconcile
Authorization: Bearer <module-service-token>
Content-Type: application/json

{
  "reservationId": "<uncertain-reservation>",
  "providerRequestId": "<provider-request-id>",
  "evidenceSource": "PROVIDER",
  "usage": {
    "inputTokens": 120,
    "outputTokens": 40
  }
}
```

Caller assertion, missing evidence, or a negative lookup cannot release
uncertain capacity.

### Schedule Through CronJob

CronJob owns scheduling; `aiProviders` owns repair. Configure a CronJob internal
target to call:

```js
jobDetail: {
    internal: {
        module: 'aiProviders',
        method: 'POST',
        uri: '/internal/ai-ledger/repair/scan',
        body: {
            scheduleCode: 'ai-ledger-repair',
            dryRun: true
        }
    }
}
```

`aiProviders` derives a deterministic idempotency key from `scheduleCode` and
the configured `scheduleWindowMinutes`. Begin with dry-run jobs and review
findings before configuring an apply job with a distinct schedule code. CronJob
uses the tenant's internal service token; do not configure a human token or
call the ledger database directly.

### Manual Approval Mode

Set `ledger.repair.deterministicRepairApprovalMode` to `MANUAL` when operations
policy requires separation of duties:

1. a service-token scan records an open deterministic finding;
2. a human with `ai.ledger.repair.approve` approves the finding;
3. a service identity calls
   `POST /internal/ai-ledger/repair/findings/apply`;
4. the ledger reconstructs counters and resolves the finding.

A human cannot execute repair, and a service identity cannot provide manual
approval. `AUTOMATIC` remains the default for deterministic evidence-based
transition recovery. Uncertain usage never uses this approval route; it still
requires positive provider usage evidence.

## Required Use Cases

### Use Case 1: Successful Employee Request

An Axis employee sends a prompt. The gateway estimates 100 tokens and
`0.10000000 USD`. The current budget has enough capacity.

Expected behavior:

1. Nodics creates one `RESERVED` record.
2. The budget reserved values increase through revision-guarded CAS.
3. The provider returns 50 actual tokens costing `0.05000000`.
4. Reserved values decrease; consumed values increase.
5. One immutable usage record is written.

### Use Case 2: Duplicate Browser Retry

The browser repeats the same request with the same idempotency key.

Expected behavior: Nodics returns the existing active reservation. It does not
reserve or charge twice. Reusing the key with a changed plan is rejected.

### Use Case 3: Unauthorized Operator

An employee without `ai.ledger.manage` attempts to update a ceiling.

Expected behavior: the router authorization boundary rejects the request before
the ledger operations service mutates data.

### Use Case 4: Concurrent Budget Boundary

Three requests each require 100 tokens while only 250 remain.

Expected behavior: two reservations succeed, one fails, and the persistent
budget shows 200 reserved tokens. CAS prevents all three from observing and
spending the same remaining balance.

### Use Case 5: Failure Before Provider Invocation

A request reserves capacity, but adapter preparation fails before invocation.

Expected behavior: the reservation moves through `RELEASING` to `RELEASED` and
capacity becomes available again.

### Use Case 6: Timeout After Provider Invocation

The provider may have received the request, but the response is lost.

Expected behavior: reservation becomes `UNCERTAIN`. Capacity remains held.
Operators inspect the record. The implemented reconciliation API accepts
positive provider usage evidence; automatic provider lookup remains future
adapter work. Manual database deletion is prohibited.

### Use Case 7: Partner Customization

A logistics application wants one monthly budget shared by all employees but
separate by AI usage profile.

The project overrides `scopeDimensions` to tenant, enterprise, application, and
profile. It does not edit Nodics framework services. The project adds an
override test showing two principals resolve to the same scope and another
tenant does not.

## Security And Privacy

- Tenant identity comes from trusted request context.
- Principal identity comes from authenticated context.
- Provider and model come from the provider profile, not request input.
- Pricing comes from validated configuration.
- No prompts, credentials, or provider secrets belong in budget records.
- Operational responses must remain bounded and permission-protected.
- Usage evidence should use correlation identifiers rather than sensitive
  prompt text.

Projects adding new fields must classify their data and confirm retention,
export, deletion, and audit obligations.

## Performance And Scale

- Budget mutation uses one indexed budget code and revision.
- Idempotency uses indexed reservation identity.
- List APIs are limited to 500 records.
- Expiry is bounded by `expiryBatchSize`.
- Cost arithmetic uses `BigInt`; do not replace it with floating point.
- Cache must never approve capacity. Later read-only acceleration must use
  nCache and invalidate after persistent changes.

For very high write volume, a project may replace the repository with a
database-specific transactional implementation. The service lifecycle,
idempotency, tenant scope, exact arithmetic, usage evidence, and tests remain
mandatory.

## Observability

Operators should correlate:

- reservation code and state;
- budget code and revision;
- tenant, enterprise, application, principal, profile, provider, and model;
- pricing/configuration revisions;
- correlation/request ID;
- reserved and consumed exact values;
- CAS retry exhaustion, rejection, expiry, uncertainty, and overage.

Do not log credentials, provider authorization headers, full prompts, sensitive
tool results, or secret references.

Sanitized process-local repair counters and persistent runs/findings are
implemented. Export adapters, alert rules, and repair dashboards remain
follow-up work.

## Deployment And Topology

The schema/service capability can run in a monoServer during local development
or in an active modular AI Providers server. Every process must use the same
authoritative tenant database for a shared budget. Local in-memory cache is not
a substitute for shared persistence.

Before enabling a real provider:

1. activate `gAi` and `aiProviders` in the intended server;
2. configure database connectivity;
3. configure profiles, secret references, exact pricing, and limits;
4. create permissions;
5. build indexes;
6. run focused and topology tests;
7. validate backup, restore, expiry, and uncertain-usage procedures.

## Backup, Restore, And Migration

Back up the budget, reservation, usage, repair-run, and repair-finding
collections consistently with tenant data. Preserve
exact strings, revisions, states, timestamps, and correlation identities.

After restore:

1. validate indexes and unique constraints;
2. compare budget totals with reservation and usage evidence;
3. identify transitional and uncertain records;
4. do not reset counters merely to make totals match;
5. execute a governed reconciliation plan.

Schema or scope migrations require a preview, test-tenant validation, rollback
plan, and audit evidence. A new period/scope policy normally applies to new
windows; rewriting active windows can invalidate idempotency and capacity.

## Troubleshooting

| Symptom | Likely cause | Safe action |
| --- | --- | --- |
| Budget exceeded | Reserved plus consumed capacity reaches the ceiling. | Inspect tenant-bound budget and active reservations; increase only with authorization. |
| Idempotency conflict | Same key represents a different plan. | Generate a new request key; do not delete evidence. |
| CAS retry exhausted | Heavy concurrent mutation or stale repository behavior. | Inspect database latency/indexes and retry through the authoritative request path. |
| Reservation remains uncertain | Provider response was ambiguous. | Retain capacity and collect provider evidence. |
| Reservation remains reconciling/releasing | Process failed during a cross-record transition. | Preview and apply the bounded repair scan; do not directly edit totals. |
| Ledger unavailable | Persistent repository or database is unavailable. | Fail closed and restore database service; do not bypass reservation. |

## Developer Extension Checklist

Before changing the ledger:

1. Read root, `gAi`, and `aiProviders` `AGENTS.md`.
2. Confirm `aiProviders` remains the owner.
3. Search for an existing service, schema, router, and cache authority.
4. Keep caller inputs provider-neutral.
5. Keep exact arithmetic and fail-closed reservation.
6. Derive tenant and principal from trusted context.
7. Keep usage immutable and uncertain usage reserved.
8. Use a later-loaded module for project policy.
9. Add successful, rejected, boundary, recovery, tenant-isolation,
   concurrency, idempotency, and override tests.
10. Update README, module docs, `llm/contracts`, `llm/examples`, and generated
    context.

## Verification

```text
node gAi/aiProviders/test/aiTokenEconomicsContract.test.js
node gAi/aiProviders/test/aiPersistentTokenLedgerContract.test.js
node gAi/aiProviders/test/aiTokenLedgerApiContract.test.js
node gAi/aiProviders/test/aiTokenLedgerRepairContract.test.js
node gAi/aiProviders/test/aiProviderGatewayContract.test.js
npm run llm:generate
npm run llm:validate
```

## Related Documentation

- [AI Token Economics And Optimization](token-economics-and-optimization.md)
- [AI Providers README](../README.md)
- [Nodics Documentation](../../../gDocs/README.md)
