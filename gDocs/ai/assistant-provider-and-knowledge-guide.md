# Assistant, AI Providers, and Knowledge Guide

This guide explains the implemented Nodics backend capability from a business
overview through developer and operator details. The capability is disabled by
default. Employee-secured JSON APIs and normalized SSE delivery are implemented.
Nodics supplies the CMS composition contract for the Axis chat screen;
rendering remains in the separate `nodicsaxis` repository. Confirmed enterprise
creation and optional Workflow handoff are implemented.

## What A Business Can Use

The implemented backend can:

1. accept an authenticated employee's read-only Assistant turn;
2. keep that employee's conversations isolated from other employees and
   tenants;
3. redact configured sensitive patterns before provider execution;
4. retrieve approved documentation evidence with citations;
5. estimate and reserve token/cost capacity before calling an AI provider;
6. use OpenAI, Anthropic, or Google through one provider-neutral gateway;
7. retain normalized usage and replayable Assistant events.
8. create, list, and load employee-owned conversations through secured APIs;
9. submit and inspect turns, replay persisted events, and cancel an accepted
   turn through provider-neutral contracts.
10. bind enterprise-create approval to immutable arguments and execute through
    Profile;
11. hand configured multi-step work to Workflow and retain only its carrier
    reference.

No customer identity can use the Axis Assistant flow. A partner can reuse the
same modules for another employee assistant by configuration and later-layer
prompt/source contributions.

## Responsibility Map

| Owner | Responsibility |
| --- | --- |
| `aiAssistant` | Conversation, message, turn, event, prompt, confirmation and orchestration |
| `aiKnowledge` | Corpus, explicit sources, chunks, evidence and citations |
| `aiProviders` | Selection, credentials, estimates, pricing, budgets, retries and normalized results |
| Provider module | Vendor request/response translation only |
| `nDatabase` | Generated-service persistence and transactions |
| `nCache` | Rate-limit and eligible reuse storage |
| `nSearch` | Indexing and retrieval execution |
| Profile | Employee identity and permissions |
| BackOffice/CMS | Capability discovery and non-executable Axis page composition |
| Workflow | Durable multi-step state, manual actions, retries and recovery |
| CronJob | Scheduling disabled ledger maintenance jobs |

Do not copy these responsibilities into a customer module. Override the
smallest configuration or service implementation through normal Nodics
layering.

## Safe Default State

- `aiAssistant.enabled` is `false`.
- `aiKnowledge.enabled` is `false`.
- `aiProviders.enabled` is `false`.
- Every vendor provider is `enabled: false`.
- The two contributed CronJobs are inactive.
- No secret is stored in source, `package.json`, a schema, or browser code.
- No provider is usable without active code, registration, configuration,
  exact pricing, an opaque secret reference, rate limiting, and the persistent
  ledger.

## Administrator Setup

Create a later-layer `properties.js` contribution. Configure:

1. one `aiProviders.profiles` entry;
2. an enabled provider whose module is active;
3. a model alias;
4. revisioned exact-decimal rates and currency;
5. a secret reference understood by the deployment's secret resolver;
6. token and exact-cost ceilings;
7. Assistant or Knowledge activation only after dependencies are ready.

Never put an API key into the properties object. `secretReference` is an opaque
identifier such as a vault path. Runtime resolution happens only on the
backend.

The Google adapter supports `GEMINI_API` and `VERTEX`. Gemini API uses an API
key resolved from the reference. Vertex uses a resolved bearer credential plus
configured project and location. OpenAI uses Responses API. Anthropic uses
Messages API.

## Token And Failure Behavior

## Confirmed Enterprise Creation

1. The employee asks to create an enterprise.
2. The provider-neutral planner may return `CLARIFICATION` or a
   `MUTATION_PROPOSAL`; neither is executable.
3. Assistant resolves the proposal's stable identity against the active tool
   policy and the current employee-filtered BackOffice observation of Profile.
   A model-supplied URL, method, permission, credential, or unknown argument is
   rejected.
4. Missing `code` or `name` emits structured clarification. It creates no
   confirmation and performs no Profile call.
5. When code and name are present, Assistant validates the bounded proposal and
   creates a `PENDING` confirmation containing a client-safe impact
   summary and SHA-256 argument digest. No enterprise exists yet.
6. Axis displays the impact. Approval must return the same digest and expected
   revision before expiry.
7. Execute atomically claims the confirmation as `EXECUTING`. A concurrent or
   replayed request cannot win the same database claim.
8. Without `workflowCode`, Assistant forwards the human bearer and idempotency
   key to Profile. Profile rechecks permission, validates fields, rejects
   duplicates, and persists through its generated enterprise service.
9. With `workflowCode`, Assistant creates one Workflow carrier. Workflow owns
   all actions, manual approvals, retries, recovery, and final process state.
10. Success becomes `CONSUMED`. A target failure after dispatch becomes
   `UNCERTAIN` and is never blindly retried.

Expired or changed confirmations must be recreated. Permission removal is
enforced by Profile at execution time. Customer and service tokens cannot use
the employee confirmation routes.

### Offline acceptance

`gAi/aiAssistant/test/aiAssistantEnterpriseCreationAcceptance.test.js`
exercises the complete provider-neutral business boundary without credentials
or billable provider traffic. It feeds deterministic structured planner output
through current-contract resolution, the real confirmation service, approval,
and the existing Profile module transport. It proves clarification without
persistence, safe confirmation projection, employee-bearer forwarding,
successful consumption, stale revision, replay rejection, tenant isolation,
expiry, duplicate-target rejection, and uncertain target failure.

The acceptance uses injected test output and transport only. It does not
register a mock production provider, bypass `aiProviders`, or create another
mutation executor. Live provider wording and model behavior remain a separate
credentialed local acceptance step.

## Axis Content and Repository Boundary

BackOffice core data contributes the authenticated `/assistant` page to
`axisContentCatalog`, including template, slots, safe text properties, and
logical renderer keys. Core import remains explicit and idempotent; server
startup never imports this content.

The workspace component owns localized title, welcome, empty state, input
placeholder, Send, Stop, employee, Assistant, working, cancelling, and failure
labels. It also owns conversation-history, new-conversation, empty-history,
pagination, clarification, governed-action, confirmation, approval, execution,
expiry, and completion labels. Operators change those values through CMS
content rather than editing Axis source. Axis owns layout and interaction only;
CMS cannot supply React, HTML, JavaScript, CSS, or event handlers.

Axis renders structured `CLARIFICATION`, `TOOL_PLAN`, and
`CONFIRMATION_REQUIRED` events as separate accessible components. It never
derives target URLs, permissions, mutation arguments, digests, or revisions.
Approval sends the exact persisted digest and revision returned by Assistant;
execution uses only the confirmation code. Malformed events fail closed, and
Profile or Workflow remains the final business authority.

Axis also renders the complete safe tool lifecycle (`TOOL_PLAN`,
`TOOL_STARTED`, and `TOOL_RESULT`), governed citation metadata, normalized
token categories, and usage-reconciliation state. Raw tool responses,
arguments, internal target URLs, reservation identifiers, credentials, and
provider diagnostics do not enter the presentation model. Citation locators
remain text until an owning backend contract explicitly marks a navigation
target safe. Axis does not calculate authoritative cost, remaining budget, or
quota from token counts; those values require an explicit client-safe
aiProviders projection.

Nodics owns content contracts, authentication, authorization, persistence,
workflow, provider calls, and SSE APIs. `nodicsaxis` owns React renderers,
responsive/mobile-webview presentation, accessibility, SSE consumption, and
browser state. Neither repository may copy the other's authority.

Each cost-bearing attempt has a different idempotency identity and reservation.
If a provider fails after invocation started, its reservation becomes
`UNCERTAIN`; a fallback attempt creates another reservation. This avoids
reporting a possibly billed request as free.

Pricing is immutable within a plan. A configured `effectiveAt` or `expiresAt`
outside the attempt time rejects execution. Exact cost uses decimal-string and
BigInt arithmetic, never JavaScript floating point.

Eligible deterministic response or embedding reuse is stored only through
nCache. A cache entry never approves spend capacity and never replaces the
persistent ledger.

## Documentation Knowledge Flow

Only explicit published documents may be ingested:

```text
gDocs or another authoritative source
  -> explicit source contribution
  -> deterministic document and section chunks
  -> optional aiProviders embeddings
  -> nSearch candidate index
  -> governed retrieval
  -> evidence plus citations
  -> Assistant prompt context
```

Root `docs/` is temporary planning material and is rejected as a runtime
Knowledge source. Knowledge does not crawl schemas or query a database
directly. A business module must explicitly contribute a safe projection before
its records can become Knowledge material.

Retrieval always filters by tenant, corpus, audience, and allowed
classification. When no evidence reaches the configured score, the response
marks evidence insufficient. Assistant refuses an evidence-required answer
instead of inventing one.

## Employee Turn Flow

1. Profile authenticates an employee.
2. Assistant validates that the identity is human and not a customer.
3. The effective configuration is snapshotted.
4. Sensitive text is redacted and the user message is persisted.
5. The active approved prompt version is loaded.
6. Recent history is bounded without removing security instructions.
7. Knowledge returns governed evidence and citations when requested.
8. `aiProviders` estimates, rate-limits, reserves, resolves the credential, and
   invokes the configured adapter.
9. Usage is reconciled and normalized.
10. Assistant persists the answer and replay events.

Axis implements the employee conversation composer, streamed text, progress,
cancellation, and failure presentation. Backend JSON APIs, durable events, and
authenticated normalized SSE delivery remain the authority.

## Employee API workflow

After Profile authentication, an employee with the required permissions uses
the `aiAssistant` module routes:

1. `POST /conversations` with a definition code creates an owned conversation.
2. `GET /conversations` lists only that employee's bounded result page.
3. `GET /conversations/:conversationCode` loads one owned conversation.
4. `GET /conversations/:conversationCode/history` returns a bounded,
   client-safe page of persisted turns and redacted user/Assistant messages.
   It excludes configuration snapshots, provider identifiers, credentials,
   leases, and internal execution metadata.
5. `POST /conversations/:conversationCode/turns` submits a message and
   idempotency key. The enabled Assistant Definition supplies the governed
   prompt and provider-profile codes.
6. `GET /conversations/:conversationCode/turns/:turnCode` reads status.
7. `GET /conversations/:conversationCode/turns/:turnCode/events` replays a
   bounded ordered page after an optional sequence.
8. `POST /conversations/:conversationCode/turns/:turnCode/cancel` cancels only
   a queued turn or requests cancellation of active provider execution.
9. `GET /conversations/:conversationCode/turns/:turnCode/stream` replays missed
   events and continues live delivery.

Required permissions are `ai.assistant.use`, `ai.assistant.read`, and
`ai.assistant.cancel`. The standard Profile bearer pipeline authenticates the
employee. Assistant adds no second login or token authority. Tenant and
principal values in browser payloads are neither required nor trusted.

If an employee guesses another employee's conversation or turn identifier, the
ownership-filtered lookup returns no accessible record. Customers and
module/service identities are rejected. Result and event sizes are bounded by
the effective `aiAssistant.api` configuration. The `aiAssistant` API exposure
category remains disabled at framework level and must be explicitly enabled by
an environment; Startio Local enables it for local development.

Turn submission returns HTTP 202 once the user message, turn, and accepted event
are durable. Axis then connects to the stream. Each SSE frame contains a stable
event ID and sequence. Axis retains the latest event ID and sends it as
`Last-Event-ID` after reconnect. Nodics replays later persisted events before
continuing live delivery. Heartbeats keep idle connections observable.

A browser disconnect removes only the live subscriber; it does not cancel the
business turn. Explicit cancellation propagates to the active provider request.
If provider invocation may already have incurred cost, `aiProviders` preserves
uncertain accounting rather than guessing that usage was free.

Cancellation intent is persisted before any process-local abort. The owning
employee can cancel an accepted turn immediately or move an executing turn to
`CANCELLATION_REQUESTED`. The lease owner observes that state through its
heartbeat even when the request reached another server. Raw browser reason
text is not retained. Conditional terminal updates ensure completion and
cancellation cannot both win, and recovery finishes an abandoned cancellation
without invoking the provider again.

The current live subscriber registry is deliberately process-local and is not a
second event store. In distributed operation a reconnect may reach another
node, which recovers from durable turn events. A later deployment may override
live fan-out with the existing messaging authority while preserving the same
SSE and persistence contracts.

Provider execution itself uses a different rule: each accepted turn is claimed
with a persisted compare-and-set lease before any provider call. The winning
runtime renews a bounded heartbeat and projects the lease through nCache. For
monoServer development the local cache engine is sufficient. A distributed
deployment configures the existing `aiAssistant.executionLease` channel to
Redis or Hazelcast; it does not add another registry or turn store.

If a runtime stops, the service-token recovery endpoint scans a bounded tenant
batch. A turn abandoned before provider invocation is marked retry-required.
A turn abandoned in the provider phase is marked provider-outcome-uncertain
and is not automatically invoked again. This avoids duplicate cost and
duplicate side effects. Operations reconcile the provider ledger/evidence,
then the employee may submit a new turn with a new idempotency key when safe.

Operations users with `ai.assistant.operations.read` can inspect
`GET /operations/ai-assistant/diagnostics`. It reports sanitized readiness and
fixed counters for lease claims, conflicts, renewals, heartbeat/cache failures,
and recovery outcomes. It never returns prompts, responses, tenant identifiers,
employee identifiers, turn identifiers, provider identifiers, or credentials.
The optional nSystem readiness contribution surfaces Assistant degradation
without making unrelated Nodics capabilities unavailable.

## Operations And Recovery

Core import contributes three inactive CronJob records:

- `aiAssistantTurnRecoveryJob`;
- `aiTokenReservationExpiryJob`;
- `aiTokenLedgerRepairScanJob`.

Operations must review configuration and permissions before activation.
CronJob only invokes service-token-protected internal APIs. `aiProviders`
retains all ledger state and repair decisions.

The Assistant recovery job is assigned to `node0` and defaults to a two-minute
schedule and 30-second module-call timeout. Operators may update its persisted
Cron expression, node assignment, timeout, logging, and active state before
creating and starting it. Batch size and lease timing come from the layered
`aiAssistant.execution` configuration. Concurrent scans remain safe because
each candidate recovery uses a persisted tenant-scoped compare-and-set.

On a timeout after provider invocation, do not manually release capacity.
Inspect the uncertain reservation and use provider evidence through the
governed reconciliation process. Repair scanning is dry-run-first.

The OpenAI adapter can retrieve a stored Response's positive usage evidence.
Anthropic and Gemini adapters currently report provider lookup unavailable
because their implemented generation contracts do not provide an equivalent
reliable message lookup. Those reservations remain uncertain until governed
external evidence or a later adapter capability is available; the system does
not guess or release them.

## Partner Customization

A partner adding another provider should:

1. create a provider module under `gAi/aiProviders`;
2. translate only the vendor protocol;
3. implement truthful capabilities, estimation, cancellation, and normalized
   usage;
4. self-register during module lifecycle;
5. run the common adapter conformance suite;
6. leave selection, secrets, pricing, retry, ledger, cache, and controls in the
   parent module.

A partner adding application knowledge should contribute an explicit source or
safe model projection from the authoritative module. Do not create another
index engine, crawler, database client, or retrieval store.

Knowledge persistence and search deliberately use two views of the same
`knowledgeChunk` schema:

- the generated item service persists the authoritative derived chunk record;
- the same generated service exposes nSearch indexing and retrieval methods
  when the schema search contract is enabled.

Do not call `DefaultSearchService` for chunk indexing or retrieval: it is the
generated database service for the `search` schema, not the nSearch client.
Candidate versions may be indexed before approval, but indexed retrieval always
loads the corpus and filters by its `activeIndexVersion`. Activation and rollback
change this corpus-owned pointer with optimistic revision matching; nSearch
continues to own index creation, query execution, and provider translation.

Retrieval strategy and search execution are independent. `INDEXED`, `LIVE`, and
`HYBRID` describe where evidence comes from. `LEXICAL`, `VECTOR`, and `HYBRID`
describe how nSearch queries an index. The first operational mode is lexical.
Vector and hybrid search remain disabled until an environment supplies an
explicit vector mapping and dimensions, a compatible embedding profile, and a
capable nSearch adapter.

### Running Knowledge locally

Knowledge is intentionally disabled by default. Enable it only in the chosen
local environment after nSearch is healthy. Submit published source documents
through the internal ingestion route, inspect the durable run, and activate the
candidate through the employee operations route. A completed ingestion is not
an activation.

If nSearch fails partway through ingestion, the run is recorded as failed and
the corpus continues serving its previous active version. Repair nSearch and
use a new run code. Completed run codes replay safely without duplicate
indexing. Readiness and bounded metrics are available to employees with
`ai.knowledge.read`; activation and rollback require
`ai.knowledge.manage`.

## Verification

Run:

```text
node gFramework/nTooling/bin/nodics-tool.js test:suite --suite=ai
npm run build
npm run llm:generate
npm run llm:validate
```

The focused suite covers success, disabled defaults, inline-secret rejection,
provider translation, rate limits, retry/fallback accounting, transaction and
hierarchy behavior, employee/customer boundaries, redaction, citation
preservation, nSearch delegation, temporary-doc rejection, and ledger repair.
The secured-route contract additionally covers route metadata, cross-principal
rejection, replay boundaries, and idempotent distributed cancellation.
The SSE contract covers cursor validation, normalized frames, terminal closure,
incremental provider chunks, and response ownership.

## Continue

- [How AI Cost Governance Works](how-ai-cost-governance-works.md)
- [Module Documentation Index](../reference/module-documentation-index.md)
